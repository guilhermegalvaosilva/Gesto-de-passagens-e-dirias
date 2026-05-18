export function NotificationsPanel({ logs }) {
  const recent = logs.slice(0, 8);

  return (
    <section className="dashboard-section admin-panel active">
      <div className="dashboard-card notification-panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Notificações</span>
            <h3>Atualizações para todos os usuários</h3>
            <p className="table-note">
              Toda criação ou edição de formulário aparece aqui.
            </p>
          </div>
        </div>
        <div className="notifications-list">
          {recent.length ? (
            recent.map((log) => (
              <article className="notification-item" key={log.id}>
                <span className="notification-dot" />
                <div>
                  <strong>{log.titulo}</strong>
                  <p>
                    {log.campoAlterado}: {log.valorOriginal} -&gt; {log.valorNovo}
                  </p>
                  <small>
                    {log.dataAlteracaoClient} por {log.alteradoPor}
                  </small>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-records">Ainda não há notificações.</div>
          )}
        </div>
      </div>
    </section>
  );
}
