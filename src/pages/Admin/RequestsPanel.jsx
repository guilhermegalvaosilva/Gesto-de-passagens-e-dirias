import { REQUESTS_PAGE_SIZE } from "../../config/appConfig";
import { RecordCard } from "./RecordCard";

export function RequestsPanel({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  needFilter,
  setNeedFilter,
  sectorFilter,
  setSectorFilter,
  sectorOptions,
  statusOptions,
  rows,
  total,
  page,
  totalPages,
  setPage,
  onDelete,
}) {
  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
    setNeedFilter("all");
    setSectorFilter("all");
  }

  return (
    <section className="dashboard-section admin-panel active">
      <div className="admin-table-panel requests-workspace">
        <div className="panel-heading requests-heading">
          <div>
            <span className="section-kicker">Registros</span>
            <h3>Solicitações cadastradas</h3>
            <p className="table-note">
              Consulte a fila com filtros rápidos e cartões resumidos para análise operacional.
            </p>
          </div>
          <div className="queue-meta">
            {total
              ? `${(page - 1) * REQUESTS_PAGE_SIZE + 1}-${Math.min(
                  page * REQUESTS_PAGE_SIZE,
                  total,
                )} de ${total}`
              : "0 registros"}
          </div>
        </div>

        <div className="requests-control-bar">
          <label className="search-label requests-search" htmlFor="requests-search">
            <span>Pesquisar</span>
            <input
              id="requests-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, evento, projeto, origem ou destino"
            />
          </label>
          <label htmlFor="status-filter">
            <span>Status</span>
            <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todos</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="date-filter">
            <span>Período</span>
            <select id="date-filter" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
              <option value="all">Todas</option>
              <option value="today">Hoje</option>
            </select>
          </label>
          <label htmlFor="need-filter">
            <span>Necessidade</span>
            <select id="need-filter" value={needFilter} onChange={(event) => setNeedFilter(event.target.value)}>
              <option value="all">Todas</option>
              <option value="Passagens">Passagens</option>
              <option value="Diárias">Diárias</option>
              <option value="Passagens e Diárias">Passagens e Diárias</option>
            </select>
          </label>
          <label htmlFor="sector-filter">
            <span>Setor</span>
            <select id="sector-filter" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
              <option value="all">Todos</option>
              {sectorOptions.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-ghost" onClick={clearFilters}>
            Limpar
          </button>
        </div>

        <div className="records-list">
          {rows.length ? (
            rows.map((item) => (
              <RecordCard key={item.id} item={item} onDelete={onDelete} />
            ))
          ) : (
            <div className="empty-records">Nenhuma solicitação encontrada.</div>
          )}
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
