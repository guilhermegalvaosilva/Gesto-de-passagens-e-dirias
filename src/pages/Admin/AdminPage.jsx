import { useCallback, useEffect, useState } from "react";

import { Message } from "../../components/common/Message";
import { STORAGE_KEYS } from "../../config/storageKeys";
import { apiRequest, logoutAdmin, savedSession, validateSession } from "../../services/api";
import { exportRequestsWorkbook } from "../../utils/excel";
import { AdminSidebar } from "./AdminSidebar";
import { AuditPanel } from "./AuditPanel";
import { AlertsPanel } from "./AlertsPanel";
import { Dashboard } from "./Dashboard";
import { FinancePanel } from "./FinancePanel";
import { FlightsPanel } from "./FlightsPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { RequestsPanel } from "./RequestsPanel";

export function AdminPage({ onBack }) {
  const [activeTab, setActiveTab] = useState(
    window.localStorage.getItem(STORAGE_KEYS.activeAdminTab) || "dashboard",
  );
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const loadData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const [requestsPayload, auditPayload] = await Promise.all([
        apiRequest("/solicitacoes?sort=createdAt&order=desc"),
        apiRequest("/alteracoes?sort=dataAlteracao&order=desc"),
      ]);
      setRequests(requestsPayload.data || []);
      setAuditLogs(auditPayload.data || []);
      setLastUpdatedAt(new Date());
      setMessage(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao carregar painel.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.activeAdminTab, activeTab);
  }, [activeTab]);

  useEffect(() => {
    validateSession().then((user) => {
      if (!user) {
        onBack();
        return;
      }
      void loadData();
    });
  }, [loadData, onBack]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadData({ silent: true });
    }, 60000);
    return () => window.clearInterval(interval);
  }, [loadData]);

  function setTab(tab) {
    setActiveTab(tab);
  }

  function exportWorkbook() {
    exportRequestsWorkbook(requests);
  }

  async function deleteRequest(id) {
    if (!confirm("Tem certeza que deseja apagar este registro?")) return;
    await apiRequest(`/solicitacoes/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadData();
  }

  async function logout() {
    await logoutAdmin();
    onBack();
  }

  return (
    <section className="admin-dashboard">
      <div className="dashboard-shell">
        <AdminSidebar
          activeTab={activeTab}
          onTab={setTab}
          onExport={exportWorkbook}
          onLogout={logout}
        />
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div className="dashboard-title-block">
              <span className="section-kicker">Visão administrativa</span>
              <h2>Painel administrativo</h2>
              <p className="subtitle">
                Operação consolidada, filtros vivos e documentos prontos para
                alterações, financeiro e logística.
              </p>
            </div>
            <div className="dashboard-header-meta">
              <div className="admin-session-card">
                <span className="status-dot" />
                <div>
                  <small>Usuário ativo</small>
                  <strong>{savedSession().login || "admin"}</strong>
                </div>
              </div>
              <div className="admin-session-card">
                <span className="status-dot" />
                <div>
                  <small>Atualizado</small>
                  <strong>
                    {lastUpdatedAt
                      ? lastUpdatedAt.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "..."}
                  </strong>
                </div>
              </div>
              <div className="dashboard-actions">
                <button type="button" onClick={() => loadData()}>
                  Atualizar
                </button>
                <button type="button" onClick={exportWorkbook}>
                  Exportar Excel
                </button>
                <button type="button" className="btn-ghost" onClick={logout}>
                  Sair
                </button>
              </div>
            </div>
          </div>
          <Message message={message} />
          {loading && <div className="empty-records">Carregando dados...</div>}
          {activeTab === "dashboard" && <Dashboard requests={requests} />}
          {activeTab === "solicitacoes" && (
            <RequestsPanel rows={requests} onDelete={deleteRequest} />
          )}
          {activeTab === "alertas" && <AlertsPanel logs={auditLogs} />}
          {activeTab === "alteracoes" && <AuditPanel logs={auditLogs} />}
          {activeTab === "notificacoes" && <NotificationsPanel logs={auditLogs} />}
          {activeTab === "financeiro" && <FinancePanel requests={requests} />}
          {activeTab === "passagens" && <FlightsPanel requests={requests} />}
          {activeTab === "diarias" && <FinancePanel requests={requests} />}
        </div>
      </div>
    </section>
  );
}
