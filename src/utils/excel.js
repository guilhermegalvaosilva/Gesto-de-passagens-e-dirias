import { labels, requestFields } from "../data/formData";
import { REQUEST_STATUS_OPTIONS } from "../config/requestStatus";
import {
  displayValue,
  formatCurrency,
  normalizedFilterText,
  parseMoneyValue,
} from "./formatters";

const THEME = {
  navy: "#08283D",
  blue: "#123F5D",
  blueSoft: "#EDF4F8",
  gold: "#B98A34",
  goldSoft: "#FFF7E6",
  border: "#C7D5E2",
  text: "#17202E",
};

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function workbookDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}

function currentLogin() {
  try {
    return (
      JSON.parse(localStorage.getItem("formulario_demanda_admin_session") || "{}").login ||
      "admin"
    );
  } catch {
    return "admin";
  }
}

function countByNeed(rows, need) {
  return rows.filter((item) =>
    normalizedFilterText(item.necessidade).includes(need),
  ).length;
}

function summaryFromRows(rows) {
  const totalDaily = rows.reduce(
    (sum, item) => sum + parseMoneyValue(item.valorMaximoDiaria),
    0,
  );
  const withDailyValue = rows.filter((item) => parseMoneyValue(item.valorMaximoDiaria) > 0);
  const average = withDailyValue.length ? totalDaily / withDailyValue.length : 0;
  const routes = new Set(
    rows
      .filter((item) => item.localOrigem && item.localDestino)
      .map((item) => `${item.localOrigem} -> ${item.localDestino}`),
  );

  return [
    ["Solicitações exportadas", rows.length],
    ["Com passagens", countByNeed(rows, "passagens")],
    ["Com diárias", countByNeed(rows, "diaria")],
    ["Rotas diferentes", routes.size],
    ["Total estimado de diárias", formatCurrency(totalDaily)],
    ["Média por solicitação com valor", formatCurrency(average)],
    ["Gerado em", workbookDate()],
    ["Usuário", currentLogin()],
  ];
}

function textCell(value, style = "Cell") {
  return `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function numberCell(value, style = "NumberCell") {
  return `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${Number(value) || 0}</Data></Cell>`;
}

function row(cells, height = "") {
  const heightAttr = height ? ` ss:Height="${height}"` : "";
  return `<Row${heightAttr}>${cells.join("")}</Row>`;
}

function column(width) {
  return `<Column ss:AutoFitWidth="0" ss:Width="${width}" />`;
}

function buildSummarySheet(rows) {
  const summaryRows = summaryFromRows(rows)
    .map(([label, value], index) =>
      row([
        textCell(label, "SummaryLabel"),
        typeof value === "number"
          ? numberCell(value, "SummaryValue")
          : textCell(value, "SummaryValue"),
      ], index < 6 ? 28 : 24),
    )
    .join("");

  return `
    <Worksheet ss:Name="Resumo">
      <Table>
        ${column(230)}
        ${column(210)}
        ${row([textCell("Relatório Administrativo NUGB / GEREB", "Title")], 34)}
        ${row([textCell("Exportação de passagens e diárias", "Subtitle")], 24)}
        ${row([textCell("", "Blank")], 10)}
        ${summaryRows}
      </Table>
    </Worksheet>`;
}

function buildRequestsSheet(rows) {
  const header = row(
    requestFields.map((field) => textCell(labels[field] || field, "Header")),
    30,
  );

  const body = rows
    .map((item, index) =>
      row(
        requestFields.map((field) =>
          textCell(displayValue(field, item), index % 2 ? "CellAlt" : "Cell"),
        ),
        24,
      ),
    )
    .join("");

  return `
    <Worksheet ss:Name="Solicitações">
      <Table>
        ${requestFields.map((field) => column(field === "justificativa" ? 280 : 155)).join("")}
        ${header}
        ${body}
      </Table>
      <AutoFilter x:Range="R1C1:R${rows.length + 1}C${requestFields.length}" xmlns="urn:schemas-microsoft-com:office:excel" />
    </Worksheet>`;
}

function buildStatusSheet(rows) {
  const statusRows = REQUEST_STATUS_OPTIONS.map((status) => {
    const count = rows.filter((item) => (item.status || "Recebida") === status).length;
    const percent = rows.length ? `${Math.round((count / rows.length) * 100)}%` : "0%";
    return row([
      textCell(status, "SummaryLabel"),
      numberCell(count, "SummaryValue"),
      textCell(percent, "SummaryValue"),
    ], 26);
  }).join("");

  return `
    <Worksheet ss:Name="Status">
      <Table>
        ${column(180)}
        ${column(110)}
        ${column(110)}
        ${row([textCell("Status da fila", "Title")], 34)}
        ${row([textCell("Distribuição das solicitações por situação administrativa", "Subtitle")], 24)}
        ${row([textCell("", "Blank")], 10)}
        ${row([textCell("Status", "Header"), textCell("Quantidade", "Header"), textCell("Percentual", "Header")], 28)}
        ${statusRows}
      </Table>
    </Worksheet>`;
}

function buildWorkbook(rows) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>NUGB / GEREB</Author>
    <Title>Relatório Administrativo NUGB</Title>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="${THEME.text}" />
      <Alignment ss:Vertical="Top" ss:WrapText="1" />
    </Style>
    <Style ss:ID="Title">
      <Font ss:FontName="Segoe UI" ss:Size="18" ss:Bold="1" ss:Color="#FFFFFF" />
      <Interior ss:Color="${THEME.navy}" ss:Pattern="Solid" />
      <Alignment ss:Vertical="Center" />
    </Style>
    <Style ss:ID="Subtitle">
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#D7E3EE" />
      <Interior ss:Color="${THEME.navy}" ss:Pattern="Solid" />
    </Style>
    <Style ss:ID="Blank" />
    <Style ss:ID="SummaryLabel">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="${THEME.navy}" />
      <Interior ss:Color="${THEME.blueSoft}" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${THEME.border}" />
      </Borders>
    </Style>
    <Style ss:ID="SummaryValue">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#6D4B08" />
      <Interior ss:Color="${THEME.goldSoft}" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${THEME.border}" />
      </Borders>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#FFFFFF" />
      <Interior ss:Color="${THEME.blue}" ss:Pattern="Solid" />
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="${THEME.gold}" />
      </Borders>
    </Style>
    <Style ss:ID="Cell">
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${THEME.border}" />
      </Borders>
      <NumberFormat ss:Format="@" />
    </Style>
    <Style ss:ID="CellAlt">
      <Interior ss:Color="#F3F8FC" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${THEME.border}" />
      </Borders>
      <NumberFormat ss:Format="@" />
    </Style>
    <Style ss:ID="NumberCell">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="${THEME.navy}" />
      <Interior ss:Color="${THEME.goldSoft}" ss:Pattern="Solid" />
    </Style>
  </Styles>
  ${buildSummarySheet(rows)}
  ${buildStatusSheet(rows)}
  ${buildRequestsSheet(rows)}
</Workbook>`;
}

export function exportRequestsWorkbook(rows) {
  if (!rows.length) {
    alert("Não há dados para exportar.");
    return;
  }

  const workbook = buildWorkbook(rows);
  const blob = new Blob([workbook], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio_nugb_${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
