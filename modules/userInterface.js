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



let refs = {
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

let selectedCategoria = null;
let onSubmitHandler = null;
let onRemoveHandler = null;
let editingId = null;
let onEditHandler = null;

export function onEditarTransacao(handler) {
  onEditHandler = handler;
}

export function entrarModoEdicao(transacao) {
  editingId = transacao.id;

  refs.inputDescricao.value = transacao.descricao;
  refs.inputValor.value = transacao.valor;
  refs.selectTipo.value = transacao.tipo;

  // selecionar categoria visualmente
  selectedCategoria = transacao.categoria;
  refs.root.querySelectorAll(".categoria-btn").forEach(b => {
    const isSel = b.dataset.value === selectedCategoria;
    b.classList.toggle("selected", isSel);
    b.setAttribute("aria-pressed", isSel ? "true" : "false");
  });

  // muda label do botão
  const txt = refs.form.querySelector(".btn-text");
  if (txt) txt.textContent = "Guardar alterações";
}

export function sairModoEdicao() {
  editingId = null;
  limparFormulario();

  const txt = refs.form.querySelector(".btn-text");
  if (txt) txt.textContent = "Adicionar ao histórico";
}

export function getEditingId() {
  return editingId;
}



export function criarEstrutura(rootSelector = "#app") {
  const root = document.querySelector(rootSelector);
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
      style: ""
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

  refs.cardSaldo = cardSaldo.querySelector(".valor");
  refs.cardReceitas = cardReceitas.querySelector(".valor");
  refs.cardDespesas = cardDespesas.querySelector(".valor");

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

  refs.listaTransacoes = historico.querySelector(".lista-transacoes");

  transacoesSection.append(novaTransacao, historico);
  main.append(cardsSection, transacoesSection);

  // ----- FOOTER (tem de ficar dentro do #app por causa da grid)
  const footer = el("footer", { className: "footer" }, [
    el("p", { textContent: "© 2026 Minhas Finanças. Todos os direitos reservados." }),
  ]);

  // Monta tudo dentro do #app
  root.append(sidebar, header, main, footer);

  refs.root.addEventListener("click", (e) => {
  const edit = e.target.closest("[data-action='edit']");
  if (edit) {
    const id = edit.dataset.id;
    if (typeof onEditHandler === "function") onEditHandler(id);
    return;
  }

  const del = e.target.closest("[data-action='delete']");
  if (del) {
    const id = del.dataset.id;
    if (typeof onRemoveHandler === "function") onRemoveHandler(id);

    
  }
});


  // Guarda refs
  refs.form = form;
  refs.inputDescricao = form.querySelector("#descricao");
  refs.inputValor = form.querySelector("#quantidade");
  refs.selectTipo = form.querySelector("#tipo-transacao");
  refs.btnSubmit = form.querySelector("#adiciona-historia");
  refs.categoriasWrap = categoriasWrap;

  // Eventos: categorias
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".categoria-btn");
    if (!btn) return;

    // limpa selected em TODOS os botões
    root.querySelectorAll(".categoria-btn").forEach((b) => {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", "false");
    });

    btn.classList.add("selected");
    btn.setAttribute("aria-pressed", "true");
    selectedCategoria = btn.dataset.value;
  });

  // Evento: submit do form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (typeof onSubmitHandler === "function") {
    onSubmitHandler(lerFormulario(), editingId); // ✅ passa editingId
  }
});


  // Evento: remover transação (delegation)
  root.addEventListener("click", (e) => {
    const del = e.target.closest("[data-action='delete']");
    if (!del) return;
    const id = del.dataset.id;
    if (typeof onRemoveHandler === "function") onRemoveHandler(id);
  });

  return refs;
}

/** Lê dados do form (e valida o mínimo). */
export function lerFormulario() {
  const descricao = (refs.inputDescricao?.value || "").trim();
  const valorRaw = refs.inputValor?.value;
  const valor = Number(valorRaw);
  const tipo = refs.selectTipo?.value;

  if (!descricao) throw new Error("Preenche a descrição.");
  if (!Number.isFinite(valor) || valor <= 0) throw new Error("O valor tem de ser um número positivo.");
  if (!selectedCategoria) throw new Error("Selecciona uma categoria.");

  return {
    descricao,
    valor,
    tipo, // "receita" | "despesa"
    categoria: selectedCategoria,
    dataISO: new Date().toISOString(),
  };
}

export function limparFormulario() {
  if (!refs.form) return;
  refs.form.reset();
  selectedCategoria = null;
  refs.root.querySelectorAll(".categoria-btn").forEach((b) => b.classList.remove("selected"));
}

/** Renderiza cards + lista. Passa as transações como array. */
export function renderizarDashboard(transacoes = []) {
  const { saldo, receitas, despesas } = calcularTotais(transacoes);
  atualizarCards({ saldo, receitas, despesas });
  renderizarHistorico(transacoes);
}

/** Renderiza lista de transações. Espera items com: id, descricao, categoria, tipo, valor, dataISO */
export function renderizarHistorico(transacoes = []) {
   
  if (!refs.listaTransacoes) return;

  refs.listaTransacoes.innerHTML = "";

  transacoes.forEach((t) => {
    
    const data = formatarData(t.dataISO);
    const valorFmt = formatarMoeda(t.valor);
    const isReceita = t.tipo === "receita";

    const row = el("div", { className: "item-transacao" });

    // Coluna 1: info
    const info = el("div", { className: "info-transacao" }, [
      el("div", { className: "caixa-icone" }, [
        el("span", { className: "euro-icon", textContent: "€" }),
      ]),
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

    // Coluna 4: valor + delete
    const valor = el("div", { className: "valor-transacao" }, [
  el("span", { 
    className: isReceita ? "positivo" : "negativo", 
    textContent: valorFmt 
  }),

  el("button", {
    type: "button",
    dataset: { action: "edit", id: String(t.id) },
    textContent: "Editar",
    style: "margin-left:12px; background:transparent; border:1px solid currentColor; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px;"
  }),

  el("button", {
    type: "button",
    dataset: { action: "delete", id: String(t.id) },
    textContent: "×",
    title: "Remover",
    style: "margin-left:8px; background:transparent; border:none; cursor:pointer; font-size:16px; color:inherit;"
  }),
]);


    row.append(info, cat, dt, valor);
    refs.listaTransacoes.appendChild(row);
  });
}

export function atualizarCards({ saldo, receitas, despesas }) {
  if (refs.cardSaldo) refs.cardSaldo.textContent = formatarMoeda(saldo);
  if (refs.cardReceitas) refs.cardReceitas.textContent = formatarMoeda(receitas);
  if (refs.cardDespesas) refs.cardDespesas.textContent = formatarMoeda(despesas);
}

export function onSubmitTransacao(handler) {
  onSubmitHandler = handler;
}

export function onRemoverTransacao(handler) {
  onRemoveHandler = handler;
}

// ---------------- helpers

function calcularTotais(transacoes) {
  // obrigatório usar reduce pelo enunciado
  const receitas = transacoes.reduce((acc, t) => acc + (t.tipo === "receita" ? Number(t.valor) : 0), 0);
  const despesas = transacoes.reduce((acc, t) => acc + (t.tipo === "despesa" ? Number(t.valor) : 0), 0);
  const saldo = receitas - despesas;
  return { saldo, receitas, despesas };
}

function formatarMoeda(n) {
  const v = Number(n) || 0;
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);
}

function formatarData(iso) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-PT").format(d);
  } catch {
    return "";
  }
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  // props normais
  Object.entries(props).forEach(([k, v]) => {
    if (k === "dataset" && v && typeof v === "object") {
      Object.entries(v).forEach(([dk, dv]) => (node.dataset[dk] = dv));
      return;
    }
    if (k in node) node[k] = v;
    else node.setAttribute(k, v);
  });

  // children
  if (!Array.isArray(children)) children = [children];
  children.forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });

  return node;
}

function menuItem(texto, active = false) {
  const wrap = el("div", { className: `containers-services${active ? " first" : ""}` }, [
    el("div", { className: "list-icons" }),
    el("li", { className: "menu-itens", textContent: texto }),
  ]);
  return wrap;
}

function card(titulo, valor, valorClass, infoText) {
  const c = el("div", { className: "card" }, [
    el("div", { className: "titulo-card", textContent: titulo }),
    el("div", { className: `valor ${valorClass || ""}`.trim(), textContent: valor }),
    el("div", { className: `informacao ${valorClass || ""}`.trim(), textContent: infoText }),
  ]);
  return c;
}

function categoriaBtn(nome) {
  return el("button", {
    type: "button",
    className: "categoria-btn",
    dataset: { value: nome },
    textContent: nome,
    "aria-pressed": "false",
    
  });
}
