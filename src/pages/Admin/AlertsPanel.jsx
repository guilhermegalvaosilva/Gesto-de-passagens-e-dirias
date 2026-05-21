import { auditColumns } from "../../data/formData";
import { isToday, normalizedFilterText } from "../../utils/formatters";

function isCreation(log) {
  const type = normalizedFilterText(log.tipoAlteracao);
  const reason = normalizedFilterText(log.motivoAlteracao);
  return type.includes("criacao") || reason.includes("novo formulario");
}

function notificationLabel(log) {
  return isCreation(log) ? "Novo formulário" : "Edição";
}

function AlertTile({ label, value, note }) {
  return (
    <article className="alert-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function AlertsPanel({ logs }) {
  const currentDayLogs = logs.filter((log) => isToday(log.dataAlteracao));
  const creationCount = logs.filter(isCreation).length;
  const editionCount = logs.length - creationCount;
  const recentChanges = currentDayLogs.slice(0, 10);

  return (
    <section className="dashboard-section admin-panel active">
      <div className="dashboard-card alert-dashboard-card">
        <div className="alert-hero">
          <div>
            <span className="section-kicker">Alertas</span>
            <h3>Monitoramento de notificações</h3>
            <p className="table-note">
              Acompanhe avisos críticos, alterações recentes e solicitações que demandam atenção.
            </p>
          </div>
          <div className="alert-summary">
            <span>Última varredura</span>
            <strong>{logs[0]?.dataAlteracaoClient || "Sem registros"}</strong>
          </div>
        </div>

        <div className="alert-grid">
          <AlertTile label="Total de alertas" value={logs.length} note="Registros no histórico" />
          <AlertTile label="Novos formulários" value={creationCount} note="Entradas criadas" />
          <AlertTile label="Edições recentes" value={editionCount} note="Campos atualizados" />
          <AlertTile label="Alterações hoje" value={currentDayLogs.length} note="Logs do dia presente" />
        </div>

        <div className="alert-insights-grid">
          <div className="notification-section">
            <div className="section-heading compact-heading">
              <div>
                <span className="section-kicker">Notificações</span>
                <h4>Últimas ações</h4>
              </div>
            </div>
            <div className="notifications-timeline">
              {logs.length ? (
                logs.slice(0, 6).map((log) => (
                  <article className="notification-event" key={log.id}>
                    <div className="notification-marker" aria-hidden="true" />
                    <div className="notification-event-content">
                      <div className="notification-event-top">
                        <span className="notification-type">{notificationLabel(log)}</span>
                        <small>{log.dataAlteracaoClient || "-"}</small>
                      </div>
                      <strong>{log.titulo || "Registro"}</strong>
                      <p>
                        {log.campoAlterado || "Campo"}: {log.valorOriginal || "-"} → {log.valorNovo || "-"}
                      </p>
                      <span className="notification-author">{log.alteradoPor || "sistema"}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-records">Nenhuma notificação registrada.</div>
              )}
            </div>
          </div>

          <div className="audit-section">
            <div className="section-heading compact-heading">
              <div>
                <span className="section-kicker">Alterações</span>
                <h4>Histórico de edição</h4>
              </div>
            </div>
            {currentDayLogs.length ? (
              <div className="audit-table-wrapper compact">
                <table className="audit-table">
                  <thead>
                    <tr>
                      {auditColumns.map(([, label]) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentChanges.map((log) => (
                      <tr key={log.id}>
                        {auditColumns.map(([key]) => (
                          <td key={key}>{log[key] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-records">Nenhuma alteração de edição registrada hoje.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
