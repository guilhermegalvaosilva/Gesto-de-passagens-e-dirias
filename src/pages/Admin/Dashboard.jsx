import {
  createdAtDisplay,
  formatCurrency,
  formatDate,
  normalizeText,
  normalizedFilterText,
  parseMoneyValue,
} from "../../utils/formatters";

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(value) {
  const date = dateValue(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

function countBy(rows, getter) {
  return rows.reduce((acc, item) => {
    const key = normalizeText(getter(item)) || "Não informado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(source, limit = 5) {
  return Object.entries(source)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function statusClass(status) {
  return normalizedFilterText(status).replace(/\s+/g, "-") || "recebida";
}

function Kpi({ title, value, note, progress = 72, gaugeLabel, tone = "blue" }) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const label = gaugeLabel || `${Math.round(safeProgress)}%`;

  return (
    <article className={`kpi-card executive-kpi ${tone}`}>
      <div>
        <h4>{title}</h4>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <span
        className="kpi-orb"
        style={{ "--progress-angle": `${safeProgress * 3.6}deg` }}
        aria-hidden="true"
      >
        <b>{label}</b>
      </span>
    </article>
  );
}

function MetricStrip({ label, value, note }) {
  return (
    <div className="metric-strip-item">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function CommandRibbon({ total, todayRequests, missingFlight, missingDailyValue, nextEventDays }) {
  const pendingIssues = missingFlight.length + missingDailyValue.length;
  const readiness = total ? Math.max(0, 100 - Math.round((pendingIssues / total) * 100)) : 100;

  return (
    <article
      id="admin-overview-summary"
      className="command-ribbon"
      aria-label="Resumo de comando administrativo"
    >
      <div className="command-ribbon-main">
        <span className="section-kicker">Centro de comando</span>
        <h3>Operação NUGB em tempo real</h3>
        <p>
          Priorize registros incompletos, acompanhe novas entradas e antecipe
          eventos próximos sem sair da visão geral.
        </p>
      </div>
      <div className="command-ribbon-grid">
        <div className="command-stat">
          <span>Prontidão</span>
          <strong>{readiness}%</strong>
          <small>cadastros sem alerta crítico</small>
        </div>
        <div className="command-stat">
          <span>Hoje</span>
          <strong>{todayRequests.length}</strong>
          <small>novas solicitações</small>
        </div>
        <div className="command-stat">
          <span>Pendências</span>
          <strong>{pendingIssues}</strong>
          <small>itens para conferência</small>
        </div>
        <div className="command-stat">
          <span>Próximo evento</span>
          <strong>{nextEventDays === undefined ? "-" : `${nextEventDays}d`}</strong>
          <small>tempo restante</small>
        </div>
      </div>
    </article>
  );
}

function HealthScore({ readiness, completionRate, financeCoverage, routeCoverage }) {
  const score = Math.round(
    readiness * 0.35 + completionRate * 0.25 + financeCoverage * 0.2 + routeCoverage * 0.2,
  );

  return (
    <article className="chart-card health-command-card">
      <div className="chart-heading">
        <div>
          <h4>Saúde operacional</h4>
          <span>Qualidade geral dos cadastros e cobertura</span>
        </div>
      </div>
      <div className="health-layout">
        <div className="health-ring" style={{ "--health-angle": `${score * 3.6}deg` }}>
          <strong>{score}%</strong>
          <span>saúde</span>
        </div>
        <div className="health-bars">
          {[
            ["Prontidão", readiness],
            ["Conclusão", completionRate],
            ["Financeiro", financeCoverage],
            ["Rotas", routeCoverage],
          ].map(([label, value]) => (
            <div className="health-bar" key={label}>
              <div>
                <span>{label}</span>
                <strong>{value}%</strong>
              </div>
              <small>
                <i style={{ width: `${Math.max(value, 4)}%` }} />
              </small>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function StatusBoard({ rows, total }) {
  return (
    <article className="chart-card status-command-board">
      <div className="chart-heading">
        <div>
          <h4>Mapa da fila</h4>
          <span>Volume por status administrativo</span>
        </div>
      </div>
      <div className="status-board-grid">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div className={`status-board-item ${statusClass(label)}`} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{percent(value, total)}% da fila</small>
            </div>
          ))
        ) : (
          <div className="empty-records">Sem solicitações para classificar.</div>
        )}
      </div>
    </article>
  );
}

function PriorityQueue({ requests }) {
  if (!requests.length) {
    return <div className="empty-records">Nenhuma prioridade crítica no momento.</div>;
  }

  return (
    <div className="priority-list">
      {requests.map((item) => {
        const days = daysUntil(item.dataEvento);
        return (
          <div className="priority-item" key={item.id}>
            <div className="priority-rank">
              {days === null ? "S/P" : days <= 0 ? "Hoje" : `${days}d`}
            </div>
            <div>
              <strong>{item.nomeCompleto || item.nomeEvento || "Solicitação sem nome"}</strong>
              <span>
                {item.status || "Recebida"} | {item.necessidade || "Necessidade não informada"}
              </span>
              <small>{item.nomeEvento || item.localEvento || item.id}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeadlinePanel({ upcoming, overdue }) {
  const items = [...upcoming.slice(0, 3), ...overdue.slice(0, 2)];

  return (
    <article className="chart-card deadline-command-card">
      <div className="chart-heading">
        <div>
          <h4>Prazos e agenda</h4>
          <span>Eventos próximos e atrasados para ação</span>
        </div>
      </div>
      <div className="deadline-split">
        <div>
          <span>Próximos 7 dias</span>
          <strong>{upcoming.length}</strong>
          <small>eventos exigindo acompanhamento</small>
        </div>
        <div>
          <span>Eventos vencidos</span>
          <strong>{overdue.length}</strong>
          <small>registros para revisão imediata</small>
        </div>
      </div>
      <div className="deadline-list">
        {items.length ? (
          items.map((item) => (
            <div className="deadline-item" key={item.id}>
              <strong>{formatDate(item.dataEvento) || "-"}</strong>
              <span>{item.nomeEvento || item.nomeCompleto || item.id}</span>
            </div>
          ))
        ) : (
          <div className="empty-records">Nenhum prazo sensível encontrado.</div>
        )}
      </div>
    </article>
  );
}

function BarList({ title, subtitle, rows, total }) {
  return (
    <article className="chart-card dashboard-analytics-card">
      <div className="chart-heading">
        <div>
          <h4>{title}</h4>
          <span>{subtitle}</span>
        </div>
      </div>
      <div className="bar-list">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div className="bar-row" key={label}>
              <div className="bar-row-label">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              <div className="bar-track">
                <span style={{ width: `${Math.max(percent(value, total), 4)}%` }} />
              </div>
              <small>{percent(value, total)}%</small>
            </div>
          ))
        ) : (
          <div className="empty-records">Sem dados para este indicador.</div>
        )}
      </div>
    </article>
  );
}

function RecentList({ requests }) {
  if (!requests.length) {
    return <div className="empty-records">Nenhuma solicitação encontrada.</div>;
  }

  return (
    <div className="insight-list compact-list">
      {requests.map((item) => (
        <div className="insight-list-item" key={item.id}>
          <div>
            <strong>{item.nomeCompleto || item.nomeEvento || "Solicitação sem nome"}</strong>
            <span>
              {item.id} | {createdAtDisplay(item)}
            </span>
          </div>
          <strong>{item.status || "Recebida"}</strong>
        </div>
      ))}
    </div>
  );
}

function UpcomingEvents({ requests }) {
  const upcoming = requests
    .map((item) => ({ ...item, days: daysUntil(item.dataEvento) }))
    .filter((item) => item.days !== null && item.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  return (
    <article className="chart-card dashboard-analytics-card">
      <div className="chart-heading">
        <div>
          <h4>Próximos eventos</h4>
          <span>Agenda operacional por data do evento</span>
        </div>
      </div>
      <div className="timeline-list">
        {upcoming.length ? (
          upcoming.map((item) => (
            <div className="timeline-item" key={item.id}>
              <div>
                <strong>{formatDate(item.dataEvento)}</strong>
                <span>{item.days === 0 ? "Hoje" : `Em ${item.days} dia(s)`}</span>
              </div>
              <p>{item.nomeEvento || item.localEvento || item.id}</p>
            </div>
          ))
        ) : (
          <div className="empty-records">Nenhum evento futuro cadastrado.</div>
        )}
      </div>
    </article>
  );
}

function AlertPanel({ alerts }) {
  return (
    <article className="chart-card dashboard-analytics-card alert-card">
      <div className="chart-heading">
        <div>
          <h4>Alertas de qualidade</h4>
          <span>Pontos que pedem conferência</span>
        </div>
      </div>
      <div className="alert-list">
        {alerts.map((alert) => (
          <div className={alert.value ? "alert-item warning" : "alert-item ok"} key={alert.title}>
            <strong>{alert.value}</strong>
            <div>
              <span>{alert.title}</span>
              <small>{alert.note}</small>
            </div>
          </div>
        ))}
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
  const withDailyValue = requests.filter(
    (item) => parseMoneyValue(item.valorMaximoDiaria) > 0,
  );
  const missingFlight = requests.filter(
    (item) =>
      normalizedFilterText(item.necessidade).includes("passagens") &&
      !normalizeText(item.vooIda),
  );
  const missingDailyValue = requests.filter(
    (item) =>
      normalizedFilterText(item.necessarioValorMaximoDiaria) === "sim" &&
      parseMoneyValue(item.valorMaximoDiaria) === 0,
  );
  const totalDaily = requests.reduce(
    (sum, item) => sum + parseMoneyValue(item.valorMaximoDiaria),
    0,
  );
  const averageDaily = withDailyValue.length ? totalDaily / withDailyValue.length : 0;
  const routes = new Set(
    requests
      .filter((item) => normalizeText(item.localOrigem) && normalizeText(item.localDestino))
      .map((item) => `${item.localOrigem} -> ${item.localDestino}`),
  );
  const todayRequests = requests.filter((item) => {
    const created = dateValue(item.createdAtIso || item.createdAt);
    if (!created) return false;
    return created.toDateString() === new Date().toDateString();
  });
  const nextEventDays = requests
    .map((item) => daysUntil(item.dataEvento))
    .filter((value) => value !== null && value >= 0)
    .sort((a, b) => a - b)[0];
  const last = requests[0] ? createdAtDisplay(requests[0]) : "-";
  const statusRows = topEntries(countBy(requests, (item) => item.status || "Recebida"), 6);
  const needRows = topEntries(countBy(requests, (item) => item.necessidade), 5);
  const sectorRows = topEntries(countBy(requests, (item) => item.setorFiocruz), 5);
  const projectRows = topEntries(countBy(requests, (item) => item.idFiotec), 5);
  const completed = requests.filter((item) =>
    ["concluida", "aprovada"].includes(normalizedFilterText(item.status)),
  );
  const readiness = total
    ? Math.max(
        0,
        100 - Math.round(((missingFlight.length + missingDailyValue.length) / total) * 100),
      )
    : 100;
  const completionRate = percent(completed.length, total);
  const financeCoverage = percent(withDailyValue.length, withDaily.length || total);
  const routeCoverage = percent(routes.size, total);
  const upcomingSevenDays = requests
    .map((item) => ({ ...item, days: daysUntil(item.dataEvento) }))
    .filter((item) => item.days !== null && item.days >= 0 && item.days <= 7)
    .sort((a, b) => a.days - b.days);
  const overdue = requests
    .map((item) => ({ ...item, days: daysUntil(item.dataEvento) }))
    .filter(
      (item) =>
        item.days !== null &&
        item.days < 0 &&
        !["concluida", "cancelada"].includes(normalizedFilterText(item.status)),
    )
    .sort((a, b) => b.days - a.days);
  const priorityRequests = requests
    .map((item) => {
      const days = daysUntil(item.dataEvento);
      const hasFlightIssue =
        normalizedFilterText(item.necessidade).includes("passagens") &&
        !normalizeText(item.vooIda);
      const hasDailyIssue =
        normalizedFilterText(item.necessarioValorMaximoDiaria) === "sim" &&
        parseMoneyValue(item.valorMaximoDiaria) === 0;
      const statusWeight = ["pendente", "recebida", "em analise"].includes(
        normalizedFilterText(item.status),
      )
        ? 18
        : 0;
      const deadlineWeight = days === null ? 0 : days < 0 ? 40 : Math.max(0, 28 - days * 4);
      return {
        ...item,
        priorityScore:
          deadlineWeight + statusWeight + (hasFlightIssue ? 18 : 0) + (hasDailyIssue ? 18 : 0),
      };
    })
    .filter((item) => item.priorityScore > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 6);

  const alerts = [
    {
      title: "Passagens sem voo indicado",
      note: "Pedidos de passagem que precisam de complemento.",
      value: missingFlight.length,
    },
    {
      title: "Diárias sem valor informado",
      note: "Campo 25 marcado como SIM sem valor no campo 26.",
      value: missingDailyValue.length,
    },
    {
      title: "Registros sem setor",
      note: "Solicitações sem setor Fiocruz preenchido.",
      value: requests.filter((item) => !normalizeText(item.setorFiocruz)).length,
    },
  ];

  return (
    <section className="dashboard-section admin-panel active">
      <div className="overview-board executive-dashboard">
        <CommandRibbon
          total={total}
          todayRequests={todayRequests}
          missingFlight={missingFlight}
          missingDailyValue={missingDailyValue}
          nextEventDays={nextEventDays}
        />

        <div className="kpi-grid overview-kpis executive-kpis">
          <Kpi
            title="Total da fila"
            value={total}
            note={`${todayRequests.length} novo(s) hoje`}
            progress={total ? Math.min(100, total * 12) : 0}
            gaugeLabel="Fila"
          />
          <Kpi
            title="Passagens"
            value={withPassages.length}
            note={`${percent(withPassages.length, total)}% da fila`}
            progress={percent(withPassages.length, total)}
            tone="gold"
          />
          <Kpi
            title="Diárias"
            value={withDaily.length}
            note={`${percent(withDaily.length, total)}% da fila`}
            progress={percent(withDaily.length, total)}
            tone="green"
          />
          <Kpi
            title="Rotas"
            value={routes.size}
            note="Origem e destino distintos"
            progress={routes.size ? Math.min(100, routes.size * 18) : 0}
            gaugeLabel="Rotas"
            tone="slate"
          />
        </div>

        <div className="hero-metric-strip reference-strip">
          <MetricStrip label="Último envio" value={last} note="registro mais recente" />
          <MetricStrip
            label="Próximo evento"
            value={nextEventDays === undefined ? "-" : `${nextEventDays}d`}
            note="dias restantes"
          />
          <MetricStrip
            label="Valor estimado"
            value={formatCurrency(totalDaily)}
            note="diárias preenchidas"
          />
        </div>

        <div className="dashboard-command-grid">
          <HealthScore
            readiness={readiness}
            completionRate={completionRate}
            financeCoverage={financeCoverage}
            routeCoverage={routeCoverage}
          />
          <StatusBoard rows={statusRows} total={total} />
          <article id="admin-overview-priorities" className="chart-card priority-command-card">
            <div className="chart-heading">
              <div>
                <h4>Fila prioritária</h4>
                <span>Registros que mais pedem atenção agora</span>
              </div>
            </div>
            <PriorityQueue requests={priorityRequests} />
          </article>
        </div>

        <div className="dashboard-summary-grid">
          <article className="chart-card finance-command-card">
            <div className="chart-heading">
              <div>
                <h4>Comando financeiro</h4>
                <span>Diárias, média e cobertura de valores</span>
              </div>
            </div>
            <div className="finance-command">
              <div>
                <span>Total estimado</span>
                <strong>{formatCurrency(totalDaily)}</strong>
              </div>
              <div>
                <span>Média com valor</span>
                <strong>{formatCurrency(averageDaily)}</strong>
              </div>
              <div>
                <span>Com valor informado</span>
                <strong>
                  {withDailyValue.length}/{total}
                </strong>
              </div>
            </div>
          </article>
          <AlertPanel alerts={alerts} />
          <DeadlinePanel upcoming={upcomingSevenDays} overdue={overdue} />
        </div>

        <div id="admin-overview-indicators" className="analytics-grid">
          <BarList
            title="Distribuição por necessidade"
            subtitle="Passagens, diárias e combinados"
            rows={needRows}
            total={total}
          />
          <BarList
            title="Status da fila"
            subtitle="Situação administrativa atual"
            rows={statusRows}
            total={total}
          />
          <BarList
            title="Top setores Fiocruz"
            subtitle="Áreas com maior volume"
            rows={sectorRows}
            total={total}
          />
          <BarList
            title="Top projetos"
            subtitle="IDs FIOTEC mais recorrentes"
            rows={projectRows}
            total={total}
          />
        </div>

        <div className="dashboard-bottom-grid">
          <article className="chart-card chart-card-large">
            <div className="chart-heading">
              <div>
                <h4>Solicitações recentes</h4>
                <span>Últimos registros recebidos no painel</span>
              </div>
            </div>
            <RecentList requests={requests.slice(0, 6)} />
          </article>
          <UpcomingEvents requests={requests} />
        </div>
      </div>
    </section>
  );
}
