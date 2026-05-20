import { auditColumns } from "../../data/formData";
import { isEditionAuditLog, isToday } from "../../utils/formatters";

export function AuditPanel({ logs }) {
  const todayLogs = logs.filter(
    (log) => isToday(log.dataAlteracao) && isEditionAuditLog(log),
  );

  return (
    <section className="dashboard-section admin-panel active">
      <div className="admin-table-panel audit-panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Alterações do dia</span>
            <h3>Histórico de alterações</h3>
            <p className="table-note">
              Mostra o campo alterado, o valor antigo e o valor informado na alteração.
            </p>
          </div>
          <div className="audit-count">
            <strong>{todayLogs.length}</strong>
            <span>hoje</span>
          </div>
        </div>
        {todayLogs.length ? (
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  {auditColumns.map(([, label]) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayLogs.map((log) => (
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
          <div className="empty-records">Nenhuma alteração registrada hoje.</div>
        )}
      </div>
    </section>
  );
}
