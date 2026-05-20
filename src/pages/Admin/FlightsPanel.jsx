import { formatDate, normalizeText, normalizedFilterText } from "../../utils/formatters";

const CLOSED_STATUS_KEYS = new Set(["concluida", "cancelada"]);

function routeKey(item) {
  const origin = normalizeText(item.localOrigem);
  const destination = normalizeText(item.localDestino);
  return origin && destination ? `${origin} - ${destination}` : "";
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

function countRoutes(rows) {
  return Object.entries(
    rows.reduce((acc, item) => {
      const key = routeKey(item);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);
}

function countStatus(rows) {
  return Object.entries(
    rows.reduce((acc, item) => {
      const key = normalizeText(item.status) || "Recebida";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function countBy(rows, getter, limit = 6) {
  return Object.entries(
    rows.reduce((acc, item) => {
      const key = normalizeText(getter(item)) || "Não informado";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function FlightMetric({ label, value, note, tone }) {
  return (
    <article className={`flight-metric ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function FlightStatusChart({ rows, total }) {
  const max = Math.max(...rows.map(([, value]) => value), 1);
  const mainStatus = rows[0];

  return (
    <article className="chart-card flight-status-card">
      <div className="chart-heading">
        <h4>Status das passagens</h4>
        <small>
          {mainStatus
            ? `${mainStatus[0]} concentra ${mainStatus[1]} pedido(s)`
            : "Sem passagens para analisar"}
        </small>
      </div>

      <div className="flight-status-chart">
        {rows.length ? (
          rows.map(([status, value]) => (
            <div className="flight-status-row" key={status}>
              <div>
                <span>{status}</span>
                <strong>{value}</strong>
              </div>
              <div aria-hidden="true">
                <span style={{ width: `${Math.max(8, percent(value, max))}%` }} />
              </div>
              <small>{percent(value, total)}% das passagens</small>
            </div>
          ))
        ) : (
          <div className="empty-records">Nenhuma passagem encontrada.</div>
        )}
      </div>
    </article>
  );
}

function FlightRoutesChart({ routes, total }) {
  return (
    <article className="chart-card flight-routes-card">
      <div className="chart-heading">
        <h4>Rotas mais frequentes</h4>
        <small>Origem e destino mais repetidos na fila</small>
      </div>
      <div className="flight-route-list">
        {routes.length ? (
          routes.map(([route, value]) => (
            <div className="flight-route-row" key={route}>
              <div>
                <span>{route}</span>
                <strong>{value}</strong>
              </div>
              <div aria-hidden="true">
                <span style={{ width: `${percent(value, total)}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-records">Nenhuma rota com origem e destino.</div>
        )}
      </div>
    </article>
  );
}

function FlightMonthlyChart({ rows, total }) {
  const max = Math.max(...rows.map(([, value]) => value), 1);

  return (
    <article className="chart-card flight-monthly-card">
      <div className="chart-heading">
        <h4>Saídas por mês</h4>
        <small>Volume de viagens pela data de ida</small>
      </div>
      <div className="flight-monthly-chart">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div className="flight-month-column" key={label}>
              <div aria-hidden="true">
                <span style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />
              </div>
              <strong>{value}</strong>
              <small>{label}</small>
              <em>{percent(value, total)}%</em>
            </div>
          ))
        ) : (
          <div className="empty-records">Nenhuma viagem com data de ida.</div>
        )}
      </div>
    </article>
  );
}

function FlightPendingList({ rows }) {
  return (
    <article className="chart-card flight-pending-card">
      <div className="chart-heading">
        <h4>Voos pendentes por urgência</h4>
        <small>Solicitações sem indicação de voo de ida</small>
      </div>
      <div className="flight-pending-list">
        {rows.length ? (
          rows.map(({ item, days }) => (
            <div className="flight-pending-item" key={item.id}>
              <div>
                <strong>{item.nomeCompleto || item.nomeEvento || item.id}</strong>
                <span>{formatDate(item.dataIda) || "Sem data"} | {routeKey(item) || "Rota incompleta"}</span>
              </div>
              <b>{days === null ? "Sem data" : days < 0 ? "Vencida" : `${days}d`}</b>
            </div>
          ))
        ) : (
          <div className="flight-clear-state">
            <strong>Nenhum voo pendente</strong>
            <span>Todas as passagens carregadas têm indicação de voo.</span>
          </div>
        )}
      </div>
    </article>
  );
}

function FlightDestinationChart({ rows, total }) {
  return (
    <article className="chart-card flight-destination-card">
      <div className="chart-heading">
        <h4>Destinos com maior demanda</h4>
      </div>
      <div className="flight-route-list">
        {rows.length ? (
          rows.map(([destination, value]) => (
            <div className="flight-route-row" key={destination}>
              <div>
                <span>{destination}</span>
                <strong>{value}</strong>
              </div>
              <div aria-hidden="true">
                <span style={{ width: `${percent(value, total)}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-records">Nenhum destino informado.</div>
        )}
      </div>
    </article>
  );
}

export function FlightsPanel({ requests }) {
  const passageRows = requests.filter((item) =>
    normalizedFilterText(item.necessidade).includes("passagens"),
  );
  const withFlight = passageRows.filter((item) => normalizeText(item.vooIda));
  const missingFlight = passageRows.filter((item) => !normalizeText(item.vooIda));
  const activeMissingFlight = missingFlight.filter((item) => !CLOSED_STATUS_KEYS.has(statusKey(item)));
  const routes = countRoutes(passageRows);
  const destinationRows = countBy(passageRows, (item) => item.localDestino);
  const statusRows = countStatus(passageRows);
  const completion = percent(withFlight.length, passageRows.length);
  const next7 = passageRows.filter((item) => {
    const days = daysUntil(item.dataIda);
    return days !== null && days >= 0 && days <= 7;
  });
  const next30 = passageRows.filter((item) => {
    const days = daysUntil(item.dataIda);
    return days !== null && days >= 0 && days <= 30;
  });
  const overdueMissing = activeMissingFlight.filter((item) => {
    const days = daysUntil(item.dataIda);
    return days !== null && days < 0;
  });
  const urgentMissingRows = activeMissingFlight
    .map((item) => ({ item, days: daysUntil(item.dataIda) }))
    .sort((a, b) => (a.days ?? 999) - (b.days ?? 999))
    .slice(0, 6);
  const monthlyRows = Object.entries(
    passageRows.reduce((acc, item) => {
      if (!item.dataIda) return acc;
      const label = monthLabel(item.dataIda);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => {
      const first = passageRows.find((item) => monthLabel(item.dataIda) === a[0])?.dataIda;
      const second = passageRows.find((item) => monthLabel(item.dataIda) === b[0])?.dataIda;
      return monthSortValue(first) - monthSortValue(second);
    })
    .slice(-6);

  return (
    <section className="dashboard-section admin-panel active">
      <div className="dashboard-card flights-dashboard-card">
        <div className="flights-hero">
          <div>
            <span className="section-kicker">Logística</span>
            <h3>Mapa de voos e rotas</h3>
            <p className="table-note">
              Acompanhe indicações de voo, status das passagens, rotas recorrentes e viagens próximas.
            </p>
          </div>
          <div className="flight-completion" aria-label={`${completion}% dos voos informados`}>
            <strong>{completion}%</strong>
            <span>voos informados</span>
            <div aria-hidden="true">
              <span style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>

        <div className="flight-metric-grid">
          <FlightMetric
            label="Pedidos de passagem"
            value={passageRows.length}
            note="Solicitações que incluem passagens."
          />
          <FlightMetric
            label="Viagens em 7 dias"
            value={next7.length}
            note={`${next30.length} viagem(ns) nos próximos 30 dias.`}
          />
          <FlightMetric
            label="Com indicação de voo"
            value={withFlight.length}
            note="Campo voo de ida preenchido."
          />
          <FlightMetric
            label="Pendentes ativos"
            value={activeMissingFlight.length}
            note="Sem voo e ainda não encerrados."
            tone="attention"
          />
          <FlightMetric
            label="Vencidos sem voo"
            value={overdueMissing.length}
            note="Data de ida passou sem indicação."
            tone="attention"
          />
          <FlightMetric
            label="Rotas mapeadas"
            value={routes.length}
            note="Rotas com origem e destino completos."
          />
        </div>

        <div className="flights-content-grid enhanced">
          <FlightMonthlyChart rows={monthlyRows} total={passageRows.length} />
          <FlightPendingList rows={urgentMissingRows} />
          <FlightRoutesChart routes={routes} total={passageRows.length} />
          <FlightStatusChart rows={statusRows} total={passageRows.length} />
          <FlightDestinationChart rows={destinationRows} total={passageRows.length} />
        </div>
      </div>
    </section>
  );
}
