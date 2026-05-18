export const REQUEST_STATUS_OPTIONS = [
  "Recebida",
  "Em análise",
  "Pendente",
  "Aprovada",
  "Concluída",
  "Cancelada",
];

export function normalizeStatus(status) {
  return REQUEST_STATUS_OPTIONS.includes(status) ? status : "Recebida";
}
