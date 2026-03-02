/*
OBJETIVO:
Atualizar a interface sempre que o estado mudar.

PENSAMENTO:

1) Selecionar o container da lista.
2) Limpar o conteúdo antes de renderizar novamente.
3) Para cada transação:
   - Criar elemento HTML dinamicamente.
   - Inserir no DOM.
4) Atualizar os cards com os valores calculados.

REFLEXÃO:
- Por que limpar antes de renderizar?
- O que acontece se não limpar?

DESAFIO:
Como aplicar classes diferentes para receita e despesa?
*/


/*
OBJETIVO:
Atualizar a interface sempre que o estado mudar.
*/

// Se já tiveres este tipo noutro módulo (ex: transactions.ts), podes importar em vez de duplicar.
export type Transacao = {
  id: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria: string;
  dataISO: string;
};

type Refs = {
  root: HTMLElement | null;
  form: HTMLFormElement | null;
  inputDescricao: HTMLInputElement | null;
  inputValor: HTMLInputElement | null;
  selectTipo: HTMLSelectElement | null;
  btnSubmit: HTMLButtonElement | null;
  categoriasWrap: HTMLElement | null;
  listaTransacoes: HTMLElement | null;
  cardSaldo: HTMLElement | null;
  cardReceitas: HTMLElement | null;
  cardDespesas: HTMLElement | null;
};

let refs: Refs = {
  root: null,
  form: null,
  inputDescricao: null,
  inputValor: null,
  selectTipo: null,
  btnSubmit: null,
  categoriasWrap: null,
  listaTransacoes: null,
  cardSaldo: null,
  cardReceitas: null,
  cardDespesas: null,
};

// valores
let selectedCategoria: string | null = null;
let editingId: string | null = null;

// handlers
export type SubmitData = {
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria: string;
  dataISO: string;
};

type SubmitHandler = (data: SubmitData, editingId: string | null) => void;

type RemoveHandler = (id: string) => void;

type EditHandler = (id: string) => void;

let onSubmitHandler: SubmitHandler | null = null;
let onRemoveHandler: RemoveHandler | null = null;
let onEditHandler: EditHandler | null = null;

export function onEditarTransacao(handler: EditHandler): void {
  onEditHandler = handler;
}

export function entrarModoEdicao(id: string): void {
  editingId = id;
}

/** Preenche o formulário com uma transação existente (modo edição). */
export function preencherFormularioEdicao(transacao: Transacao): void {
  if (!refs.inputDescricao || !refs.inputValor || !refs.selectTipo || !refs.root || !refs.form) return;

  refs.inputDescricao.value = transacao.descricao;
  refs.inputValor.value = String(transacao.valor);
  refs.selectTipo.value = transacao.tipo;

  // selecionar categoria visualmente
  selectedCategoria = transacao.categoria;
  refs.root.querySelectorAll<HTMLElement>(".categoria-btn").forEach((b) => {
    const isSel = b.dataset.value === selectedCategoria;
    b.classList.toggle("selected", isSel);
    b.setAttribute("aria-pressed", isSel ? "true" : "false");
  });

  // muda label do botão
  const txt = refs.form.querySelector<HTMLElement>(".btn-text");
  if (txt) txt.textContent = "Guardar alterações";
}

export function sairModoEdicao(): void {
  editingId = null;
  limparFormulario();

  if (!refs.form) return;
  const txt = refs.form.querySelector<HTMLElement>(".btn-text");
  if (txt) txt.textContent = "Adicionar ao histórico";
}

export function getEditingId(): string | null {
  return editingId;
}

export function criarEstrutura(rootSelector = "#app"): Refs {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) throw new Error(`UI: não encontrei o root ${rootSelector}`);

  refs.root = root;
  root.innerHTML = ""; // limpa tudo e monta “do zero”

  // ----- SIDEBAR
  const sidebar = el("aside", { className: "sidebar" });

  const logo = el("p", { className: "logo" }, [
    document.createTextNode("As Minhas "),
    el("span", { className: "financas", textContent: "Finanças" }),
  ]);

  const menu = el("menu", { className: "menu" }, [
    el("ul", { className: "lista-de-servicos" }, [
      menuItem("Dashboard", true),
      menuItem("Relatórios"),
      menuItem("Transações"),
      menuItem("Orçamentos"),
    ]),
  ]);

  sidebar.append(logo, menu);

  // ----- HEADER
  const header = el("header", { className: "header" });

  const tituloContainer = el("div", { className: "titulo-container" }, [
    el("h2", { className: "titulo", textContent: "Overview" }),
    el("p", {
      className: "subtitle",
      textContent: "Bem-vindx de volta — aqui está o que acontece com o teu dinheiro",
      style: "",
    }),
  ]);

  const headerActions = el("div", { className: "header-actions" }, [
    el("div", { className: "calendario", textContent: "Este mês" }),
    el("button", { className: "exportar", type: "button", textContent: "Exportar" }),
  ]);

  header.append(tituloContainer, headerActions);

  // ----- MAIN
  const main = el("main", { className: "main" });

  // Cards
  const cardsSection = el("section", { className: "cards" });
  const cardsContainer = el("div", { className: "cards-container" });

  const cardSaldo = card("Balanço Total", "€ 0,00", "positivo", "—");
  const cardReceitas = card("Renda Total", "€ 0,00", "positivo", "—");
  const cardDespesas = card("Total de Despesas", "€ 0,00", "negativo", "—");

  refs.cardSaldo = cardSaldo.querySelector<HTMLElement>(".valor");
  refs.cardReceitas = cardReceitas.querySelector<HTMLElement>(".valor");
  refs.cardDespesas = cardDespesas.querySelector<HTMLElement>(".valor");

  cardsContainer.append(cardSaldo, cardReceitas, cardDespesas);
  cardsSection.append(cardsContainer);

  // Transações
  const transacoesSection = el("section", { className: "transacoes" });

  // Form “Nova Transação”
  const novaTransacao = el("div", { className: "nova-transacao" });

  const tituloNova = el("div", { className: "titulo-nova-transacao-container" }, [
    el("p", { className: "titulo-nova-transacao", textContent: "Nova Transação" }),
    el("div", { className: "nova-transacao-icon", textContent: "+" }),
  ]);

  const form = el("form", { className: "form-container", id: "form-transacao" });

  const descWrap = el("div", { className: "description-form" }, [
    el("label", { htmlFor: "descricao", textContent: "Descrição" }),
    el("input", {
      type: "text",
      id: "descricao",
      placeholder: "ex. Combustível",
      autocomplete: "off",
    }),
  ]);

  const qtdTipoWrap = el("div", { className: "qtd-tipo-transacao-container" });

  const qtd = el("div", { className: "qtd-container" }, [
    el("label", { htmlFor: "quantidade", textContent: "Valor" }),
    el("input", {
      type: "number",
      id: "quantidade",
      placeholder: "ex. 1000",
      min: "0",
      step: "0.01",
    }),
  ]);

  const tipo = el("div", { className: "tipo-transacao-container" }, [
    el("label", { htmlFor: "tipo-transacao", textContent: "Tipo" }),
    (() => {
      const s = el("select", { id: "tipo-transacao", name: "tipo-transacao" });
      s.append(
        el("option", { value: "receita", textContent: "Receita" }),
        el("option", { value: "despesa", textContent: "Despesa" })
      );
      return s;
    })(),
  ]);

  qtdTipoWrap.append(qtd, tipo);

  // Categorias (2 linhas)
  const categoriasWrap = el("div", { className: "categorias-wrap" });
  const linha1 = el("div", { className: "categoria-container", dataset: { grupo: "categorias" } }, [
    categoriaBtn("Salário"),
    categoriaBtn("Supermercado"),
    categoriaBtn("Contas"),
    categoriaBtn("Renda"),
  ]);
  const linha2 = el("div", { className: "categoria-container", dataset: { grupo: "categorias" } }, [
    categoriaBtn("Transporte"),
    categoriaBtn("Entretenimento"),
    categoriaBtn("Lazer"),
    categoriaBtn("Outros"),
  ]);

  categoriasWrap.append(linha1, linha2);

  const submit = el("button", { className: "adiciona-historia", id: "adiciona-historia", type: "submit" }, [
    el("div", { className: "btn-container" }, [
      el("div", { className: "btn-icon", textContent: "+" }),
      el("p", { className: "btn-text", textContent: "Adicionar ao histórico" }),
    ]),
  ]);

  form.append(descWrap, qtdTipoWrap, categoriasWrap, submit);
  novaTransacao.append(tituloNova, form);

  // Histórico
  const historico = el("article", { className: "historico" }, [
    el("h3", { className: "sub-titulo-historico", textContent: "Histórico Recente" }),
    el("div", { className: "table-container" }, [
      el("div", { className: "cabecalho-tabela" }, [
        el("span", { textContent: "TRANSAÇÃO" }),
        el("span", { textContent: "CATEGORIA" }),
        el("span", { textContent: "DATA" }),
        el("span", { textContent: "VALOR" }),
      ]),
      el("div", { className: "lista-transacoes" }),
      el("div", { className: "rodape-tabela" }, [
        el("a", { href: "#", className: "link-extrato", textContent: "VER EXTRATO COMPLETO →" }),
      ]),
    ]),
  ]);

  refs.listaTransacoes = historico.querySelector<HTMLElement>(".lista-transacoes");

  transacoesSection.append(novaTransacao, historico);
  main.append(cardsSection, transacoesSection);

  // ----- FOOTER
  const footer = el("footer", { className: "footer" }, [
    el("p", { textContent: "© 2026 Minhas Finanças. Todos os direitos reservados." }),
  ]);

  // Monta tudo dentro do #app
  root.append(sidebar, header, main, footer);

  // Delegation: editar/remover (uma única vez)
  refs.root.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const edit = target.closest<HTMLElement>("[data-action='edit']");
    if (edit) {
      const id = edit.dataset.id;
      if (id && typeof onEditHandler === "function") onEditHandler(id);
      return;
    }

    const del = target.closest<HTMLElement>("[data-action='delete']");
    if (del) {
      const id = del.dataset.id;
      if (id && typeof onRemoveHandler === "function") onRemoveHandler(id);
    }
  });

  // Guarda refs
  refs.form = form as HTMLFormElement;
  refs.inputDescricao = form.querySelector<HTMLInputElement>("#descricao");
  refs.inputValor = form.querySelector<HTMLInputElement>("#quantidade");
  refs.selectTipo = form.querySelector<HTMLSelectElement>("#tipo-transacao");
  refs.btnSubmit = form.querySelector<HTMLButtonElement>("#adiciona-historia");
  refs.categoriasWrap = categoriasWrap;

  // Eventos: categorias
  root.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const btn = target.closest<HTMLElement>(".categoria-btn");
    if (!btn) return;

    // limpa selected em TODOS os botões
    root.querySelectorAll<HTMLElement>(".categoria-btn").forEach((b) => {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", "false");
    });

    btn.classList.add("selected");
    btn.setAttribute("aria-pressed", "true");
    selectedCategoria = btn.dataset.value ?? null;
  });

  // Evento: submit do form
  form.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    if (typeof onSubmitHandler === "function") {
      onSubmitHandler(lerFormulario(), editingId);
    }
  });

  return refs;
}

/** Lê dados do form (e valida o mínimo). */
export function lerFormulario(): SubmitData {
  const descricao = (refs.inputDescricao?.value || "").trim();
  const valorRaw = refs.inputValor?.value;
  const valor = Number(valorRaw);
  const tipoRaw = refs.selectTipo?.value;

  if (!descricao) throw new Error("Preenche a descrição.");
  if (!Number.isFinite(valor) || valor <= 0) throw new Error("O valor tem de ser um número positivo.");
  if (tipoRaw !== "receita" && tipoRaw !== "despesa") throw new Error("Tipo inválido.");
  if (!selectedCategoria) throw new Error("Selecciona uma categoria.");

  return {
    descricao,
    valor,
    tipo: tipoRaw,
    categoria: selectedCategoria,
    dataISO: new Date().toISOString(),
  };
}

export function limparFormulario(): void {
  if (!refs.form || !refs.root) return;
  refs.form.reset();
  selectedCategoria = null;
  refs.root.querySelectorAll<HTMLElement>(".categoria-btn").forEach((b) => b.classList.remove("selected"));
}

/** Renderiza cards + lista. Passa as transações como array. */
export function renderizarDashboard(transacoes: Transacao[] = []): void {
  const { saldo, receitas, despesas } = calcularTotais(transacoes);
  atualizarCards({ saldo, receitas, despesas });
  renderizarHistorico(transacoes);
}

/** Renderiza lista de transações. */
export function renderizarHistorico(transacoes: Transacao[] = []): void {
  if (!refs.listaTransacoes) return;

  refs.listaTransacoes.innerHTML = "";

  transacoes.forEach((t) => {
    const data = formatarData(t.dataISO);
    const valorFmt = formatarMoeda(t.valor);
    const isReceita = t.tipo === "receita";

    const row = el("div", { className: "item-transacao" });

    // Coluna 1: info
    const info = el("div", { className: "info-transacao" }, [
      el("div", { className: "caixa-icone" }, [el("span", { className: "euro-icon", textContent: "€" })]),
      el("div", {}, [
        el("div", { className: "nome-transacao", textContent: t.descricao }),
        el("span", {
          className: `etiqueta ${isReceita ? "etiqueta-receita" : "etiqueta-despesa"}`,
          textContent: isReceita ? "RECEITA" : "DESPESA",
        }),
      ]),
    ]);

    // Coluna 2: categoria
    const cat = el("div", { className: "data-transacao", textContent: t.categoria });

    // Coluna 3: data
    const dt = el("div", { className: "data-transacao", textContent: data });

    // Coluna 4: valor + ações
    const valor = el("div", { className: "valor-transacao" }, [
      el("span", { className: isReceita ? "positivo" : "negativo", textContent: valorFmt }),
      el("button", {
        type: "button",
        dataset: { action: "edit", id: String(t.id) },
        textContent: "Editar",
        style:
          "margin-left:12px; background:transparent; border:1px solid currentColor; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px;",
      }),
      el("button", {
        type: "button",
        dataset: { action: "delete", id: String(t.id) },
        textContent: "×",
        title: "Remover",
        style:
          "margin-left:8px; background:transparent; border:none; cursor:pointer; font-size:16px; color:inherit;",
      }),
    ]);

    row.append(info, cat, dt, valor);
    refs.listaTransacoes!.appendChild(row);
  });
}

export function atualizarCards({ saldo, receitas, despesas }: { saldo: number; receitas: number; despesas: number }): void {
  if (refs.cardSaldo) refs.cardSaldo.textContent = formatarMoeda(saldo);
  if (refs.cardReceitas) refs.cardReceitas.textContent = formatarMoeda(receitas);
  if (refs.cardDespesas) refs.cardDespesas.textContent = formatarMoeda(despesas);
}

export function onSubmitTransacao(handler: SubmitHandler): void {
  onSubmitHandler = handler;
}

export function onRemoverTransacao(handler: RemoveHandler): void {
  onRemoveHandler = handler;
}

// ---------------- helpers

function calcularTotais(transacoes: Transacao[]): { saldo: number; receitas: number; despesas: number } {
  const receitas = transacoes.reduce((acc, t) => acc + (t.tipo === "receita" ? Number(t.valor) : 0), 0);
  const despesas = transacoes.reduce((acc, t) => acc + (t.tipo === "despesa" ? Number(t.valor) : 0), 0);
  const saldo = receitas - despesas;
  return { saldo, receitas, despesas };
}

function formatarMoeda(n: number): string {
  const v = Number(n) || 0;
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);
}

function formatarData(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-PT").format(d);
  } catch {
    return "";
  }
}

type ElDataset = Record<string, string>;

type ElProps = {
  dataset?: ElDataset;
  [key: string]: unknown;
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: ElProps = {},
  children: Array<Node | string | null | undefined> = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  Object.entries(props).forEach(([k, v]) => {
    if (k === "dataset" && v && typeof v === "object") {
      Object.entries(v as ElDataset).forEach(([dk, dv]) => (node.dataset[dk] = String(dv)));
      return;
    }

    // @ts-expect-error: atribuições dinâmicas para simplificar criação de elementos
    if (k in node) node[k] = v;
    else node.setAttribute(k, String(v));
  });

  children.forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });

  return node;
}

function menuItem(texto: string, active = false): HTMLElement {
  const wrap = el("div", { className: `containers-services${active ? " first" : ""}` }, [
    el("div", { className: "list-icons" }),
    el("li", { className: "menu-itens", textContent: texto }),
  ]);
  return wrap;
}

function card(titulo: string, valor: string, valorClass: string, infoText: string): HTMLElement {
  const c = el("div", { className: "card" }, [
    el("div", { className: "titulo-card", textContent: titulo }),
    el("div", { className: `valor ${valorClass || ""}`.trim(), textContent: valor }),
    el("div", { className: `informacao ${valorClass || ""}`.trim(), textContent: infoText }),
  ]);
  return c;
}

function categoriaBtn(nome: string): HTMLButtonElement {
  return el("button", {
    type: "button",
    className: "categoria-btn",
    dataset: { value: nome },
    textContent: nome,
    "aria-pressed": "false",
  });
}
