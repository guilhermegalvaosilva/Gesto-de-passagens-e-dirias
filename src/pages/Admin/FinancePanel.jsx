import { formatCurrency, parseMoneyValue } from "../../utils/formatters";

function Insight({ title, value, note }) {
  return (
    <article className="insight-card">
      <h4>{title}</h4>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function FinancePanel({ requests }) {
  const values = requests.map((item) => parseMoneyValue(item.valorMaximoDiaria)).filter(Boolean);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length ? total / values.length : 0;

  return (
    <section className="dashboard-section admin-panel active">
      <div className="dashboard-card">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Finanças</span>
            <h3>Contabilidade de gastos</h3>
            <p className="table-note">
              Resumo calculado com base no campo valor máximo para diária total.
            </p>
          </div>
        </div>
        <div className="insight-grid">
          <Insight title="Total estimado de diárias" value={formatCurrency(total)} note="Soma dos valores preenchidos." />
          <Insight title="Solicitações com valor" value={values.length} note="Registros com valor numérico identificado." />
          <Insight title="Média por solicitação" value={formatCurrency(average)} note="Média apenas entre solicitações com valor." />
        </div>
      </div>
    </section>
  );
}
