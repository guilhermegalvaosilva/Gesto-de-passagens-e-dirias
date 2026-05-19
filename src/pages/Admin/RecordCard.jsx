import { useState } from "react";

import { labels } from "../../data/formData";
import { createdAtDisplay, displayValue, formatDate } from "../../utils/formatters";
import { generatePDF } from "../../utils/pdf";

const recordGroups = [
  [
    "01. Cadastro do Evento",
    [
      "descricaoSolicitacao",
      "nomeEvento",
      "dataEvento",
      "localEvento",
      "justificativa",
    ],
  ],
  ["02. Projeto Vinculado", ["idFiotec", "metaProjeto", "coordenador", "setorFiocruz"]],
  [
    "03. Informações do Viajante",
    [
      "nomeCompleto",
      "dataNascimento",
      "cargoFuncao",
      "cpf",
      "banco",
      "agencia",
      "contaCorrente",
    ],
  ],
  [
    "04. Informações da Solicitação",
    [
      "necessidade",
      "localOrigem",
      "dataIda",
      "horarioIda",
      "vooIda",
      "localDestino",
      "dataVolta",
      "horarioVolta",
      "necessarioValorMaximoDiaria",
      "valorMaximoDiaria",
    ],
  ],
];

export function RecordCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const title = item.nomeCompleto || item.nomeEvento || "Solicitação sem nome";
  const route =
    item.localOrigem || item.localDestino
      ? `${item.localOrigem || "-"} → ${item.localDestino || "-"}`
      : "Rota não informada";

  return (
    <article className={`record-card ${expanded ? "expanded" : ""}`}>
      <div className="record-card-header">
        <div className="record-main">
          <div className="record-title-row">
            <span className="record-id">{item.id}</span>
            <span className="record-status-badge">{item.status || "Recebida"}</span>
          </div>
          <h4>{title}</h4>
          <small>
            Criada em {createdAtDisplay(item)}
            {item.updatedAtClient ? ` | Atualizada em ${item.updatedAtClient}` : ""}
          </small>
        </div>
        <button
          type="button"
          className="record-toggle"
          aria-label={expanded ? "Recolher detalhes" : "Ver detalhes"}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        />
      </div>
      <div className="record-summary-strip">
        <div>
          <span>Necessidade</span>
          <strong>{item.necessidade || "-"}</strong>
        </div>
        <div>
          <span>Rota</span>
          <strong>{route}</strong>
        </div>
        <div>
          <span>Ida</span>
          <strong>{formatDate(item.dataIda) || "-"}</strong>
        </div>
        <div>
          <span>Projeto</span>
          <strong>{item.metaProjeto || item.idFiotec || "-"}</strong>
        </div>
      </div>
      <div className="record-card-body">
        {recordGroups.map(([groupTitle, fields]) => (
          <div className="record-section" key={groupTitle}>
            <strong>{groupTitle}</strong>
            <div className="record-fields">
              {fields.map((field) => (
                <div className="record-field" key={field}>
                  <span>{labels[field] || field}</span>
                  <b>{displayValue(field, item)}</b>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="record-actions">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("load-form-edit", { detail: item.id }))
          }
        >
          Editar
        </button>
        <button type="button" className="btn-secondary" onClick={() => generatePDF(item)}>
          PDF
        </button>
        <button type="button" className="btn-danger" onClick={() => onDelete(item.id)}>
          Apagar
        </button>
      </div>
    </article>
  );
}
