import {
  createdAtDisplay,
  formatCurrency,
  formatDate,
  normalizeText,
  normalizedFilterText,
  parseMoneyValue,
} from "../../utils/formatters";

const OPEN_STATUS_KEYS = new Set(["recebida", "em analise", "pendente"]);
const APPROVED_STATUS_KEYS = new Set(["aprovada"]);
const CLOSED_STATUS_KEYS = new Set(["concluida", "cancelada"]);

function hasDaily(item) {
  return normalizedFilterText(item.necessidade).includes("diaria");
}

function statusKey(item) {
  return normalizedFilterText(item.status || "Recebida");
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function parseInputDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(value) {
  const date = parseInputDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

function monthLabel(value) {
  const date = parseInputDate(value);
  if (!date) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
    .format(date)
    .replace(".", "");
}

function monthSortValue(value) {
  const date = parseInputDate(value);
  return date ? date.getFullYear() * 100 + date.getMonth() : 999999;
}

function sumBy(rows, getter) {
  return Object.entries(
    rows.reduce((acc, { item, value }) => {
      const key = normalizeText(getter(item)) || "Não informado";
      acc[key] = (acc[key] || 0) + value;
      return acc;
    }, {}),
  )
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);
}

function sumValues(rows) {
  return rows.reduce((sum, row) => sum + row.value, 0);
}

function FinanceMetric({ label, value, note, highlight, tone }) {
  return (
    <article className={`finance-metric ${highlight ? "highlight" : ""} ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function FinanceBarList({ title, rows, total, empty, note }) {
  return (
    <article className="chart-card finance-chart-card">
      <div className="chart-heading">
        <h4>{title}</h4>
        {note && <small>{note}</small>}
      </div>
      <div className="finance-bar-list">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div className="finance-bar-row" key={label}>
              <div>
                <span>{label}</span>
                <strong>{formatCurrency(value)}</strong>
              </div>
              <div aria-hidden="true">
                <span style={{ width: `${percent(value, total)}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-records">{empty}</div>
        )}
      </div>
    </article>
  );
}

function FinanceDistribution({ valuedRows, total }) {
  const buckets = [
    ["Até R$ 500", valuedRows.filter(({ value }) => value <= 500).length],
    ["R$ 501 a R$ 1.500", valuedRows.filter(({ value }) => value > 500 && value <= 1500).length],
    ["Acima de R$ 1.500", valuedRows.filter(({ value }) => value > 1500).length],
  ];
  const max = Math.max(...buckets.map(([, value]) => value), 1);

  return (
    <article className="chart-card finance-column-card">
      <div className="chart-heading">
        <h4>Faixas de valores</h4>
        <small>{formatCurrency(total)} distribuídos por solicitação</small>
      </div>
      <div className="finance-column-chart">
        {buckets.map(([label, value]) => (
          <div className="finance-column" key={label}>
            <div>
              <span style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />
            </div>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function FinanceGauge({ coverage }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = (coverage / 100) * circumference;

  return (
    <article className="chart-card finance-gauge-card">
      <div className="chart-heading">
        <h4>Qualidade financeira</h4>
        <small>Percentual de diárias com valor preenchido</small>
      </div>
      <svg className="finance-gauge" viewBox="0 0 112 112" role="img" aria-label={`${coverage}% de cobertura de valores`}>
        <circle className="donut-track" cx="56" cy="56" r={radius} />
        <circle
          className="donut-value"
          cx="56"
          cy="56"
          r={radius}
          strokeDasharray={`${filled} ${circumference - filled}`}
        />
        <text x="56" y="55" textAnchor="middle">{coverage}%</text>
        <text x="56" y="70" textAnchor="middle">cobertura</text>
      </svg>
    </article>
  );
}

function FinanceMonthlyChart({ rows, total }) {
  const max = Math.max(...rows.map(([, value]) => value), 1);

  return (
    <article className="chart-card finance-monthly-card">
      <div className="chart-heading">
        <h4>Estimativa por mês de viagem</h4>
        <small>Valores agrupados pela data de ida</small>
      </div>
      <div className="finance-monthly-chart">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div className="finance-month-column" key={label}>
              <div aria-hidden="true">
                <span style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />
              </div>
              <strong>{formatCurrency(value)}</strong>
              <small>{label}</small>
              <em>{percent(value, total)}%</em>
            </div>
          ))
        ) : (
          <div className="empty-records">Nenhum mês com valor informado.</div>
        )}
      </div>
    </article>
  );
}

function FinancePendingList({ rows }) {
  return (
    <article className="chart-card finance-pending-card">
      <div className="chart-heading">
        <h4>Diárias sem valor</h4>
        <small>Solicitações que precisam de complemento financeiro</small>
      </div>
      <div className="finance-pending-list">
        {rows.length ? (
          rows.map(({ item, days }) => (
            <div className="finance-pending-item" key={item.id}>
              <div>
                <strong>{item.nomeCompleto || item.nomeEvento || item.id}</strong>
                <span>{item.status || "Recebida"} | ida {formatDate(item.dataIda) || "-"}</span>
              </div>
              <b>{days === null ? "Sem data" : days < 0 ? "Vencida" : `${days}d`}</b>
            </div>
          ))
        ) : (
          <div className="empty-records">Todas as diárias carregadas têm valor informado.</div>
        )}
      </div>
    </article>
  );
}

export function FinancePanel({ requests }) {
  const dailyRows = requests.filter(hasDaily);
  const valuedRows = dailyRows
    .map((item) => ({ item, value: parseMoneyValue(item.valorMaximoDiaria) }))
    .filter(({ value }) => value > 0);
  const total = sumValues(valuedRows);
  const average = valuedRows.length ? total / valuedRows.length : 0;
  const missingValueRows = dailyRows
    .filter((item) => parseMoneyValue(item.valorMaximoDiaria) === 0)
    .map((item) => ({ item, days: daysUntil(item.dataIda) }))
    .sort((a, b) => (a.days ?? 999) - (b.days ?? 999))
    .slice(0, 6);
  const missingValue = dailyRows.length - valuedRows.length;
  const coverage = percent(valuedRows.length, dailyRows.length);
  const openEstimate = sumValues(valuedRows.filter(({ item }) => OPEN_STATUS_KEYS.has(statusKey(item))));
  const approvedEstimate = sumValues(valuedRows.filter(({ item }) => APPROVED_STATUS_KEYS.has(statusKey(item))));
  const closedEstimate = sumValues(valuedRows.filter(({ item }) => CLOSED_STATUS_KEYS.has(statusKey(item))));
  const topValues = [...valuedRows]
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const bySector = sumBy(valuedRows, (item) => item.setorFiocruz);
  const byStatus = sumBy(valuedRows, (item) => item.status || "Recebida");
  const monthlyRows = Object.entries(
    valuedRows.reduce((acc, row) => {
      const label = monthLabel(row.item.dataIda);
      acc[label] = (acc[label] || 0) + row.value;
      return acc;
    }, {}),
  )
    .sort((a, b) => {
      const first = valuedRows.find((row) => monthLabel(row.item.dataIda) === a[0])?.item.dataIda;
      const second = valuedRows.find((row) => monthLabel(row.item.dataIda) === b[0])?.item.dataIda;
      return monthSortValue(first) - monthSortValue(second);
    })
    .slice(-6);

  return (
    <section className="dashboard-section admin-panel active">
      <div className="dashboard-card finance-dashboard-card">
        <div className="finance-hero">
          <div>
            <span className="section-kicker">Finanças</span>
            <h3>Estimativa financeira de diárias</h3>
            <p className="table-note">
              Valores calculados em tempo real a partir das solicitações com diária e campo de valor preenchido.
            </p>
          </div>
          <div className="finance-total-card">
            <span>Total estimado</span>
            <strong>{formatCurrency(total)}</strong>
            <small>{valuedRows.length} solicitação(ões) com valor | {missingValue} sem valor</small>
          </div>
        </div>

        <div className="finance-metric-grid">
          <FinanceMetric label="Em aberto" value={formatCurrency(openEstimate)} note="Recebidas, em análise e pendentes." highlight />
          <FinanceMetric label="Aprovado" value={formatCurrency(approvedEstimate)} note={`${percent(approvedEstimate, total)}% do valor estimado.`} />
          <FinanceMetric label="Encerrado" value={formatCurrency(closedEstimate)} note="Concluídas ou canceladas." />
          <FinanceMetric label="Média por diária" value={formatCurrency(average)} note="Média entre registros com valor." />
          <FinanceMetric label="Cobertura de valores" value={`${coverage}%`} note={`${valuedRows.length} de ${dailyRows.length} diária(s) preenchida(s).`} />
          <FinanceMetric label="Sem valor informado" value={missingValue} note="Diárias que precisam de complemento." tone="attention" />
        </div>

        <div className="finance-content-grid enhanced">
          <FinanceMonthlyChart rows={monthlyRows} total={total} />
          <FinanceGauge coverage={coverage} />
          <FinanceDistribution valuedRows={valuedRows} total={total} />
          <FinanceBarList
            title="Distribuição por setor"
            rows={bySector}
            total={total}
            empty="Nenhum valor por setor."
            note="Mostra onde o orçamento de diária está concentrado"
          />
          <FinanceBarList
            title="Distribuição por status"
            rows={byStatus}
            total={total}
            empty="Nenhum valor por status."
          />
          <FinancePendingList rows={missingValueRows} />
        </div>

        <article className="chart-card finance-ranking-card">
          <div className="chart-heading">
            <h4>Maiores estimativas</h4>
            <small>Registros com maior impacto no total financeiro</small>
          </div>
          <div className="finance-ranking-list">
            {topValues.length ? (
              topValues.map(({ item, value }) => (
                <div className="finance-ranking-item" key={item.id}>
                  <div>
                    <strong>{item.nomeCompleto || item.nomeEvento || item.id}</strong>
                    <span>{createdAtDisplay(item)} | {item.status || "Recebida"}</span>
                  </div>
                  <b>{formatCurrency(value)}</b>
                </div>
              ))
            ) : (
              <div className="empty-records">Nenhuma diária com valor informado.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
