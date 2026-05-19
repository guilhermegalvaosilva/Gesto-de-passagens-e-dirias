import { useCallback, useEffect, useState } from "react";

import { Topbar } from "./components/layout/Topbar";
import { STORAGE_KEYS } from "./config/storageKeys";
import { AdminPage } from "./pages/Admin/AdminPage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { HomePage } from "./pages/Home/HomePage";
import { RequestFormPage } from "./pages/RequestForm/RequestFormPage";
import { apiRequest, validateSession } from "./services/api";
import { readJSON, removeStorage } from "./services/storage";

const publicPages = new Set(["home", "form", "login"]);

function savedPage() {
  const value = window.localStorage.getItem(STORAGE_KEYS.activePage);
  return ["home", "form", "login", "admin"].includes(value) ? value : "home";
}

function App() {
  const [page, setPageState] = useState(savedPage);
  const [sessionReady, setSessionReady] = useState(false);
  const [storageMode, setStorageMode] = useState("Conectando ao backend");

  const setPage = useCallback((next) => {
    setPageState(next);
    window.localStorage.setItem(STORAGE_KEYS.activePage, next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openAdmin = useCallback(() => {
    setPage("login");
  }, [setPage]);

  useEffect(() => {
    let active = true;
    validateSession()
      .then((user) => {
        if (!active) return;
        const storedPage = savedPage();
        if (!user && !publicPages.has(storedPage)) {
          setPageState("login");
          window.localStorage.setItem(STORAGE_KEYS.activePage, "login");
        }
      })
      .finally(() => {
        if (active) setSessionReady(true);
      });

    apiRequest("/health")
      .then((payload) => {
        if (payload.database === "firestore") {
          setStorageMode("Firebase conectado");
          return;
        }
        if (payload.database === "local-json") {
          setStorageMode("Banco local conectado");
          return;
        }
        setStorageMode("Backend conectado");
      })
      .catch(() => setStorageMode("Backend indisponivel"));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      window.localStorage.setItem(STORAGE_KEYS.pendingEditId, event.detail);
      setPage("form");
    };
    window.addEventListener("load-form-edit", handler);
    return () => window.removeEventListener("load-form-edit", handler);
  }, [setPage]);

  if (!sessionReady && readJSON(STORAGE_KEYS.session, {}).token) {
    return (
      <>
        <Topbar />
        <main>
          <section className="card loading-card">Validando sessao...</section>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main>
        {page === "home" && (
          <HomePage
            storageMode={storageMode}
            onAdmin={openAdmin}
            onForm={() => {
              removeStorage(STORAGE_KEYS.pendingEditId);
              setPage("form");
            }}
          />
        )}
        {page === "login" && (
          <LoginPage onBack={() => setPage("home")} onLogin={() => setPage("admin")} />
        )}
        {page === "form" && <RequestFormPage onBack={() => setPage("home")} />}
        {page === "admin" && <AdminPage onBack={() => setPage("home")} />}
      </main>
    </>
  );
}

export default App;
