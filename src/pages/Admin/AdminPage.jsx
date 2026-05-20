import { useCallback, useEffect, useMemo, useState } from "react";

import { Message } from "../../components/common/Message";
import { REQUESTS_PAGE_SIZE } from "../../config/appConfig";
import { REQUEST_STATUS_OPTIONS } from "../../config/requestStatus";
import { STORAGE_KEYS } from "../../config/storageKeys";
import { apiRequest, logoutAdmin, savedSession, validateSession } from "../../services/api";
import { exportRequestsWorkbook } from "../../utils/excel";
import { isToday, normalizedFilterText } from "../../utils/formatters";
import { AdminSidebar } from "./AdminSidebar";
import { AuditPanel } from "./AuditPanel";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [needFilter, setNeedFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [page, setPage] = useState(1);
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

  const filteredRequests = useMemo(() => {
    let rows = search
      ? requests.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(search.toLowerCase()),
        )
      : requests;
    if (statusFilter !== "all") {
      rows = rows.filter((item) => (item.status || "Recebida") === statusFilter);
    }
    if (dateFilter === "today") {
      rows = rows.filter((item) => isToday(item.createdAtIso || item.createdAt));
    }
    if (needFilter !== "all") {
      rows = rows.filter(
        (item) => normalizedFilterText(item.necessidade) === normalizedFilterText(needFilter),
      );
    }
    if (sectorFilter !== "all") {
      rows = rows.filter((item) => (item.setorFiocruz || "Não informado") === sectorFilter);
    }
    return rows;
  }, [requests, search, statusFilter, dateFilter, needFilter, sectorFilter]);

  const sectorOptions = useMemo(
    () =>
      [...new Set(requests.map((item) => item.setorFiocruz || "Não informado"))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [requests],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / REQUESTS_PAGE_SIZE));
  const pageRows = filteredRequests.slice(
    (page - 1) * REQUESTS_PAGE_SIZE,
    page * REQUESTS_PAGE_SIZE,
  );

  function setTab(tab) {
    setActiveTab(tab);
    setPage(1);
  }

  function exportWorkbook() {
    const rows = filteredRequests.length ? filteredRequests : requests;
    exportRequestsWorkbook(rows);
  }

  async function deleteRequest(id) {
    if (!confirm("Tem certeza que deseja apagar este registro?")) return;
    await apiRequest(`/solicitacoes/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadData();
  }

  async function updateRequestStatus(item, status) {
    const next = {
      ...item,
      status,
      updatedAt: new Date().toISOString(),
      updatedAtClient: new Date().toLocaleString("pt-BR"),
    };
    await apiRequest(`/solicitacoes/${encodeURIComponent(item.id)}`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
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
            <RequestsPanel
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              needFilter={needFilter}
              setNeedFilter={setNeedFilter}
              sectorFilter={sectorFilter}
              setSectorFilter={setSectorFilter}
              sectorOptions={sectorOptions}
              statusOptions={REQUEST_STATUS_OPTIONS}
              rows={pageRows}
              total={filteredRequests.length}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              onDelete={deleteRequest}
              onStatusChange={updateRequestStatus}
            />
          )}
          {activeTab === "alteracoes" && <AuditPanel logs={auditLogs} />}
          {activeTab === "notificacoes" && <NotificationsPanel logs={auditLogs} />}
          {activeTab === "financeiro" && <FinancePanel requests={requests} />}
          {activeTab === "voos" && <FlightsPanel requests={requests} />}
        </div>
      </div>
    </section>
  );
}
