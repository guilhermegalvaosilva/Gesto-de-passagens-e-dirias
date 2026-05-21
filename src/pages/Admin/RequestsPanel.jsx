import { Fragment, useMemo, useState } from "react";
import { REQUESTS_PAGE_SIZE } from "../../config/appConfig";
import {
  createdAtDisplay,
  formatDate,
  normalizeText,
  visibleMetaProjeto,
} from "../../utils/formatters";

function normalizeValue(value) {
  return normalizeText(value || "");
}

export function RequestsPanel({ rows, onDelete }) {
  const [search, setSearch] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [travelerFilter, setTravelerFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [coordinatorFilter, setCoordinatorFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    return rows
      .filter((item) => {
        if (search && !JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (idFilter && !normalizeValue(item.id).includes(normalizeValue(idFilter))) {
          return false;
        }
        if (eventFilter && !normalizeValue(item.nomeEvento).includes(normalizeValue(eventFilter))) {
          return false;
        }
        if (travelerFilter && !normalizeValue(item.nomeCompleto).includes(normalizeValue(travelerFilter))) {
          return false;
        }
        if (projectFilter && !normalizeValue(item.idFiotec || visibleMetaProjeto(item.metaProjeto)).includes(normalizeValue(projectFilter))) {
          return false;
        }
        if (coordinatorFilter && !normalizeValue(item.coordenador).includes(normalizeValue(coordinatorFilter))) {
          return false;
        }
        if (sectorFilter && !normalizeValue(item.setorFiocruz).includes(normalizeValue(sectorFilter))) {
          return false;
        }
        if (statusFilter && !normalizeValue(item.status).includes(normalizeValue(statusFilter))) {
          return false;
        }
        if (dateFilter && !normalizeValue(item.dataEvento).includes(normalizeValue(dateFilter))) {
          return false;
        }
        if (originFilter && !normalizeValue(item.localOrigem).includes(normalizeValue(originFilter))) {
          return false;
        }
        if (destinationFilter && !normalizeValue(item.localDestino).includes(normalizeValue(destinationFilter))) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.id || "").localeCompare(b.id || ""));
  }, [rows, search, idFilter, eventFilter, travelerFilter, projectFilter, coordinatorFilter, sectorFilter, statusFilter, dateFilter, originFilter, destinationFilter]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / REQUESTS_PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * REQUESTS_PAGE_SIZE, page * REQUESTS_PAGE_SIZE);

  function clearFilters() {
    setSearch("");
    setIdFilter("");
    setEventFilter("");
    setTravelerFilter("");
    setProjectFilter("");
    setCoordinatorFilter("");
    setSectorFilter("");
    setStatusFilter("");
    setDateFilter("");
    setOriginFilter("");
    setDestinationFilter("");
    setPage(1);
  }

  return (
    <section className="dashboard-section admin-panel active">
      <div className="admin-table-panel requests-workspace">
        <div className="panel-heading requests-heading">
          <div>
            <span className="section-kicker">Solicitações</span>
            <h3>Listagem completa de solicitações</h3>
            <p className="table-note">
              Filtros detalhados por ID, evento, viajante, projeto, coordenador, setor, status, data e rota.
            </p>
          </div>
          <div className="queue-meta">
            {total ? `${(page - 1) * REQUESTS_PAGE_SIZE + 1}-${Math.min(page * REQUESTS_PAGE_SIZE, total)} de ${total}` : "0 registros"}
          </div>
        </div>

        <div className="requests-control-bar requests-filter-grid">
          <label className="search-label requests-search" htmlFor="requests-search">
            <span>Busca geral</span>
            <input
              id="requests-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por qualquer campo"
            />
          </label>
          <label htmlFor="id-filter">
            <span>ID</span>
            <input id="id-filter" value={idFilter} onChange={(event) => setIdFilter(event.target.value)} placeholder="ID da solicitação" />
          </label>
          <label htmlFor="event-filter">
            <span>Evento</span>
            <input id="event-filter" value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} placeholder="Nome do evento" />
          </label>
          <label htmlFor="traveler-filter">
            <span>Viajante</span>
            <input id="traveler-filter" value={travelerFilter} onChange={(event) => setTravelerFilter(event.target.value)} placeholder="Nome do viajante" />
          </label>
          <label htmlFor="project-filter">
            <span>Projeto FIOTEC</span>
            <input id="project-filter" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} placeholder="ID FIOTEC ou meta" />
          </label>
          <label htmlFor="coordinator-filter">
            <span>Coordenador</span>
            <input id="coordinator-filter" value={coordinatorFilter} onChange={(event) => setCoordinatorFilter(event.target.value)} placeholder="Coordenador" />
          </label>
          <label htmlFor="sector-filter">
            <span>Setor Fiocruz</span>
            <input id="sector-filter" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)} placeholder="Setor" />
          </label>
          <label htmlFor="status-filter">
            <span>Status</span>
            <input id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} placeholder="Status" />
          </label>
          <label htmlFor="date-filter">
            <span>Data do evento</span>
            <input id="date-filter" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} placeholder="aaaa-mm-dd" />
          </label>
          <label htmlFor="origin-filter">
            <span>Origem</span>
            <input id="origin-filter" value={originFilter} onChange={(event) => setOriginFilter(event.target.value)} placeholder="Local de origem" />
          </label>
          <label htmlFor="destination-filter">
            <span>Destino</span>
            <input id="destination-filter" value={destinationFilter} onChange={(event) => setDestinationFilter(event.target.value)} placeholder="Local de destino" />
          </label>
          <button type="button" className="btn-ghost clear-filters" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>

        <div className="requests-table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Evento</th>
                <th>Viajante</th>
                <th>Projeto</th>
                <th>Coordenador</th>
                <th>Setor</th>
                <th>Status</th>
                <th>Data do evento</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((item) => (
                  <Fragment key={item.id}>
                    <tr className="requests-table-row">
                      <td>{item.id}</td>
                      <td>{item.nomeEvento || "-"}</td>
                      <td>{item.nomeCompleto || "-"}</td>
                      <td>{item.idFiotec || visibleMetaProjeto(item.metaProjeto) || "-"}</td>
                      <td>{item.coordenador || "-"}</td>
                      <td>{item.setorFiocruz || "-"}</td>
                      <td>{item.status || "Recebida"}</td>
                      <td>{item.dataEvento || "-"}</td>
                      <td>{item.localOrigem || "-"}</td>
                      <td>{item.localDestino || "-"}</td>
                      <td className="requests-table-actions">
                        <button type="button" className="btn-secondary" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                          {expandedId === item.id ? "Ocultar" : "Visualizar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent("load-form-edit", { detail: item.id }))}
                        >
                          Editar
                        </button>
                        <button type="button" className="btn-danger" onClick={() => onDelete(item.id)}>
                          Apagar
                        </button>
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr className="requests-table-expand-row">
                        <td colSpan="11">
                          <div className="request-details-grid">
                            <div>
                              <strong>Descrição da solicitação</strong>
                              <p>{item.descricaoSolicitacao || "-"}</p>
                            </div>
                            <div>
                              <strong>Justificativa</strong>
                              <p>{item.justificativa || "-"}</p>
                            </div>
                            <div>
                              <strong>Valor máximo diária</strong>
                              <p>{item.valorMaximoDiaria || "-"}</p>
                            </div>
                            <div>
                              <strong>Data de ida / volta</strong>
                              <p>{formatDate(item.dataIda) || "-"} → {formatDate(item.dataVolta) || "-"}</p>
                            </div>
                            <div>
                              <strong>Voo de ida</strong>
                              <p>{item.vooIda || "-"}</p>
                            </div>
                            <div>
                              <strong>Criado em</strong>
                              <p>{createdAtDisplay(item)}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="empty-records">
                    Nenhuma solicitação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="pagination-actions">
            <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <button className="btn-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Próxima
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
