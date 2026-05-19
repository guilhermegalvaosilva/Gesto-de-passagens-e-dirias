import { useCallback, useEffect, useMemo, useState } from "react";

import { Message } from "../../components/common/Message";
import { FormSection, Input, Select, TextArea } from "../../components/form/FormControls";
import { STORAGE_KEYS } from "../../config/storageKeys";
import { blankForm, linkedProjects } from "../../data/formData";
import { apiRequest } from "../../services/api";
import { removeStorage } from "../../services/storage";
import { formatCurrencyInput, todayInputValue } from "../../utils/formatters";
import { generatePDF } from "../../utils/pdf";
import {
  buildChangeAuditLogs,
  buildCreationAudit,
  buildRequestObject,
  findLinkedProject,
} from "../../utils/requestBuilder";

const REQUIRED_PROGRESS_FIELDS = [
  "descricaoSolicitacao",
  "nomeEvento",
  "dataEvento",
  "localEvento",
  "justificativa",
  "idFiotec",
  "nomeCompleto",
  "dataNascimento",
  "cargoFuncao",
  "cpf",
  "banco",
  "agencia",
  "contaCorrente",
  "necessidade",
  "localOrigem",
  "dataIda",
  "horarioIda",
  "localDestino",
  "dataVolta",
  "horarioVolta",
];

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function validateForm(form) {
  const errors = [];
  const cpf = digitsOnly(form.cpf);

  if (cpf.length !== 11) {
    errors.push("Informe um CPF com 11 números.");
  }

  if (form.dataIda && form.dataVolta && form.dataVolta < form.dataIda) {
    errors.push("A data de volta não pode ser anterior à data de ida.");
  }

  if (form.dataEvento && form.dataIda && form.dataEvento < form.dataIda) {
    errors.push("A data do evento não pode ser anterior à data de ida.");
  }

  if (!findLinkedProject(form.idFiotec)) {
    errors.push("Selecione um ID FIOTEC válido da lista de projetos.");
  }

  if (
    form.necessarioValorMaximoDiaria === "SIM" &&
    !digitsOnly(form.valorMaximoDiaria)
  ) {
    errors.push("Informe o valor máximo da diária.");
  }

  return errors;
}

export function RequestFormPage({ onBack }) {
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState(null);
  const [editId, setEditId] = useState("");
  const [message, setMessage] = useState(null);
  const banks = Array.isArray(window.BRAZILIAN_BANKS) ? window.BRAZILIAN_BANKS : [];
  const today = todayInputValue();
  const selectedProject = useMemo(() => findLinkedProject(form.idFiotec), [form.idFiotec]);
  const completedFields = REQUIRED_PROGRESS_FIELDS.filter((field) =>
    digitsOnly(field === "cpf" ? form[field] : "") || String(form[field] || "").trim(),
  ).length;
  const progress = Math.round((completedFields / REQUIRED_PROGRESS_FIELDS.length) * 100);

  function setField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "idFiotec") {
        const project = findLinkedProject(value);
        next.metaProjeto = project?.projetoId || "";
        next.coordenador = project?.coordenador || "";
        next.setorFiocruz = project?.setorFiocruz || "";
      }
      if (name === "necessarioValorMaximoDiaria" && value !== "SIM") {
        next.valorMaximoDiaria = "";
      }
      if (name === "valorMaximoDiaria") {
        next.valorMaximoDiaria = formatCurrencyInput(value);
      }
      return next;
    });
  }

  const loadForEditById = useCallback(async (id) => {
    try {
      const payload = await apiRequest(`/solicitacoes/${encodeURIComponent(id)}`);
      const item = payload.data;
      setEditing(item);
      setForm({ ...blankForm, ...item });
      setEditId(item.id);
      setMessage({
        type: "success",
        text: `Solicitação ${item.id} carregada para edição.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao carregar solicitação.",
      });
    }
  }, []);

  useEffect(() => {
    const pendingId = window.localStorage.getItem(STORAGE_KEYS.pendingEditId);
    if (!pendingId) return;
    removeStorage(STORAGE_KEYS.pendingEditId);
    void Promise.resolve().then(() => loadForEditById(pendingId));
  }, [loadForEditById]);

  async function submit(event) {
    event.preventDefault();
    const validationErrors = validateForm(form);
    if (validationErrors.length) {
      setMessage({
        type: "error",
        text: validationErrors.join(" "),
      });
      return;
    }

    try {
      const data = buildRequestObject(form, editing);
      const auditLogs = editing
        ? buildChangeAuditLogs(editing, data)
        : buildCreationAudit(data);

      const savedRequest = await apiRequest(`/solicitacoes/${encodeURIComponent(data.id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      await Promise.all(
        auditLogs.map((log) =>
          apiRequest(`/alteracoes/${encodeURIComponent(log.id)}`, {
            method: "PUT",
            body: JSON.stringify(log),
          }),
        ),
      );

      generatePDF(data);
      setMessage({
        type: "success",
        text: editing
          ? `Solicitação atualizada com sucesso. ${auditLogs.length} alteração(ões) registrada(s).`
          : `Solicitação enviada com sucesso. ID: ${data.id}`,
      });
      if (!editing && savedRequest.database === "firestore") {
        setMessage({
          type: "success",
          text: `Solicitação enviada com sucesso. ID: ${data.id} | Firebase confirmado`,
        });
      }
      setForm(blankForm);
      setEditing(null);
      setEditId("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao salvar solicitação.",
      });
    }
  }

  return (
    <section className="card form-card journey-form-card">
      <div className="section-heading form-hero-heading">
        <div>
          <span className="section-kicker">Fiocruz Brasília | NUGB</span>
          <h2>Solicitação de viagem</h2>
          <p className="subtitle">
            Preencha os dados do evento, projeto, viajante e deslocamento. Ao enviar,
            o sistema salva o registro, gera o PDF e registra auditoria.
          </p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          Voltar ao início
        </button>
      </div>
      <div className="form-progress-lane" aria-hidden="true">
        <span>Evento</span>
        <span>Projeto</span>
        <span>Viajante</span>
        <span>Viagem</span>
      </div>

      <form onSubmit={submit}>
        <div className="form-status-panel" aria-label="Progresso do preenchimento">
          <div>
            <span>Preenchimento</span>
            <strong>{progress}% completo</strong>
          </div>
          <div className="form-progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>
            {completedFields} de {REQUIRED_PROGRESS_FIELDS.length} campos obrigatórios preenchidos.
          </small>
        </div>

        <section className="form-section edit-lookup-section">
          <h3>
            <span>ID</span>
            Editar solicitação enviada
          </h3>
          <div>
            <div className="edit-lookup-row">
              <label className="search-label">
                <span>ID da solicitação</span>
                <input
                  value={editId}
                  onChange={(event) => setEditId(event.target.value)}
                  placeholder="Ex.: SOL-20260512-ABC12345"
                />
              </label>
              <button type="button" disabled={!editId.trim()} onClick={() => loadForEditById(editId)}>
                Carregar para edição
              </button>
              {editing && (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm(blankForm);
                    setEditId("");
                  }}
                >
                  Cancelar edição
                </button>
              )}
            </div>
            <p className="mini-note">
              Use o ID gerado no envio para recuperar e atualizar a mesma solicitação.
            </p>
          </div>
        </section>

        <FormSection number="01" title="Cadastro do evento">
          <Input full label="1. Descrição da solicitação" name="descricaoSolicitacao" value={form.descricaoSolicitacao} setField={setField} required />
          <TextArea full label="2. Nome do evento" name="nomeEvento" value={form.nomeEvento} setField={setField} required />
          <Input label="3. Data do evento" name="dataEvento" type="date" min={today} value={form.dataEvento} setField={setField} required />
          <Input label="4. Local de realização do evento" name="localEvento" value={form.localEvento} setField={setField} required />
          <TextArea full label="5. Justificativa da solicitação" name="justificativa" value={form.justificativa} setField={setField} required />
        </FormSection>

        <FormSection number="02" title="Projeto vinculado" accent>
          <Input label="6. Identificação do projeto - ID FIOTEC" name="idFiotec" value={form.idFiotec} setField={setField} list="projectOptions" required />
          <Input label="7. Projeto ID / Meta do projeto" name="metaProjeto" value={form.metaProjeto} setField={setField} readOnly required />
          <Input label="8. Coordenador" name="coordenador" value={form.coordenador} setField={setField} readOnly />
          <Input label="9. Setor Fiocruz" name="setorFiocruz" value={form.setorFiocruz} setField={setField} readOnly />
          {selectedProject && (
            <div className="project-summary-card full">
              <span>Projeto selecionado</span>
              <strong>{selectedProject.projetoId} | {selectedProject.coordenador}</strong>
              <small>{selectedProject.setorFiocruz}</small>
            </div>
          )}
        </FormSection>

        <FormSection number="03" title="Informações do viajante">
          <Input full label="10. Nome completo" name="nomeCompleto" value={form.nomeCompleto} setField={setField} required />
          <Input label="11. Data de nascimento" name="dataNascimento" type="date" max={today} value={form.dataNascimento} setField={setField} required />
          <Input label="12. Cargo / Função" name="cargoFuncao" value={form.cargoFuncao} setField={setField} required />
          <Input label="13. CPF - somente números" name="cpf" value={form.cpf} setField={setField} maxLength="11" pattern="[0-9]{11}" inputMode="numeric" required />
          <Input label="14. Banco" name="banco" value={form.banco} setField={setField} list="bankOptions" required />
          <Input label="15. Agência" name="agencia" value={form.agencia} setField={setField} required />
          <Input label="16. Conta corrente" name="contaCorrente" value={form.contaCorrente} setField={setField} required />
        </FormSection>

        <FormSection number="04" title="Informações da viagem">
          <Select label="17. Qual a necessidade?" name="necessidade" value={form.necessidade} setField={setField} options={["Passagens", "Diárias", "Passagens e Diárias"]} required />
          <Input label="18. Local de origem" name="localOrigem" value={form.localOrigem} setField={setField} required />
          <Input label="19. Data de ida" name="dataIda" type="date" min={today} value={form.dataIda} setField={setField} required />
          <Select label="20. Horário de ida" name="horarioIda" value={form.horarioIda} setField={setField} options={["MANHÃ", "TARDE", "NOITE", "INDIFERENTE"]} required />
          <Input full label="21. Indicação do voo de ida" name="vooIda" value={form.vooIda} setField={setField} />
          <Input label="22. Local de destino" name="localDestino" value={form.localDestino} setField={setField} required />
          <Input label="23. Data de volta" name="dataVolta" type="date" min={today} value={form.dataVolta} setField={setField} required />
          <Select label="24. Horário de volta" name="horarioVolta" value={form.horarioVolta} setField={setField} options={["MANHÃ", "TARDE", "NOITE", "INDIFERENTE"]} required />
          <Select label="25. É necessário valor máximo para diária?" name="necessarioValorMaximoDiaria" value={form.necessarioValorMaximoDiaria} setField={setField} options={["SIM", "NÃO"]} />
          <div className="form-group">
            <label>26. Qual o valor máximo para diária total?</label>
            <div className="money-field">
              <input
                disabled={form.necessarioValorMaximoDiaria !== "SIM"}
                value={form.valorMaximoDiaria}
                onChange={(event) => setField("valorMaximoDiaria", event.target.value)}
                inputMode="numeric"
                placeholder="R$ 0,00"
              />
            </div>
            <small className="mini-note">
              Selecione "SIM" no campo 25 para informar o valor em dinheiro.
            </small>
          </div>
        </FormSection>

        <datalist id="projectOptions">
          {linkedProjects.map((project) => (
            <option key={project.idFiotec} value={project.idFiotec}>
              {project.projetoId} - {project.coordenador}
            </option>
          ))}
        </datalist>
        <datalist id="bankOptions">
          {banks.map((bank) => (
            <option key={`${bank.code}-${bank.ispb}`} value={`${bank.code} - ${bank.name}`} />
          ))}
        </datalist>
        <Message message={message} />
        <div className="actions form-actions">
          <div>
            <strong>{editing ? "Editando solicitação" : "Pronto para enviar"}</strong>
            <small>Revise os dados antes de gerar o PDF.</small>
          </div>
          <button type="submit">
            {editing ? "Salvar alterações e gerar PDF" : "Enviar, salvar e gerar PDF"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onBack}>
            Voltar ao início
          </button>
        </div>
      </form>
    </section>
  );
}
