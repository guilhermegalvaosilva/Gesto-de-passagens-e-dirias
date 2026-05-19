import {
  createdAtDisplay,
  formatCurrency,
  normalizeText,
  normalizedFilterText,
  parseMoneyValue,
} from "../../utils/formatters";

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function Metric({ title, value, note }) {
  return (
    <article className="kpi-card">
      <h4>{title}</h4>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function countBy(rows, getter) {
  return rows.reduce((acc, item) => {
    const key = normalizeText(getter(item)) || "Nao informado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function SimpleList({ title, rows, empty }) {
  return (
    <article className="chart-card dashboard-analytics-card">
      <div className="chart-heading">
        <h4>{title}</h4>
      </div>
      <div className="insight-list compact-list">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div className="insight-list-item" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))
        ) : (
          <div className="empty-records">{empty}</div>
        )}
      </div>
    </article>
  );
}

export function Dashboard({ requests }) {
  const total = requests.length;
  const withPassages = requests.filter((item) =>
    normalizedFilterText(item.necessidade).includes("passagens"),
  );
  const withDaily = requests.filter((item) =>
    normalizedFilterText(item.necessidade).includes("diaria"),
  );
  const pending = requests.filter((item) =>
    ["recebida", "em analise", "pendente"].includes(normalizedFilterText(item.status)),
  );
  const totalDaily = requests.reduce(
    (sum, item) => sum + parseMoneyValue(item.valorMaximoDiaria),
    0,
  );
  const statusRows = Object.entries(countBy(requests, (item) => item.status || "Recebida"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const recentRows = requests.slice(0, 6).map((item) => [
    item.nomeCompleto || item.nomeEvento || item.id,
    item.status || "Recebida",
  ]);
  const last = requests[0] ? createdAtDisplay(requests[0]) : "-";

  return (
    <section className="dashboard-section admin-panel active">
      <div className="overview-board executive-dashboard">
        <div className="kpi-grid overview-kpis executive-kpis">
          <Metric title="Solicitacoes" value={total} note={`Ultima entrada: ${last}`} />
          <Metric
            title="Pendentes"
            value={pending.length}
            note={`${percent(pending.length, total)}% da fila`}
          />
          <Metric title="Passagens" value={withPassages.length} note="Pedidos com passagem" />
          <Metric title="Diarias" value={withDaily.length} note={formatCurrency(totalDaily)} />
        </div>

        <div className="dashboard-summary-grid">
          <SimpleList
            title="Status da fila"
            rows={statusRows}
            empty="Nenhuma solicitacao cadastrada."
          />
          <SimpleList
            title="Registros recentes"
            rows={recentRows}
            empty="Nenhum registro recente."
          />
        </div>
      </div>
    </section>
  );
}
