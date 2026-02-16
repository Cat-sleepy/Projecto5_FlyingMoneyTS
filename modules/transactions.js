/*
OBJETIVO:
Calcular saldo total, total de receitas e total de despesas.

PENSAMENTO:

1) O saldo começa em 0.
2) Para cada transação:
   - Se for receita, soma.
   - Se for despesa, subtrai.
3) Para calcular totais separados:
   - Filtrar por tipo.
   - Somar valores.

DICA IMPORTANTE:
Use reduce().

Pergunta:
- O que é o acumulador?
- Qual deve ser o valor inicial?

Exemplo mental:
[100, -50, 200]
Resultado esperado: 250

Não escreva loops tradicionais.
*/

import { getState, setState } from "./state.js";
import { salvarDados } from "./storage.js";

export function adicionarTransacao(transacao) {
  const atual = getState();
  const novo = [transacao, ...atual];
  setState(novo);
  salvarDados(novo);
}

export function removerTransacao(id) {
  const atual = getState();
  const novo = atual.filter(t => String(t.id) !== String(id));
  setState(novo);
  salvarDados(novo);
}

// NOVO: atualizar transação
export function atualizarTransacao(id, dadosAtualizados) {
  const atual = getState();
  const novo = atual.map(t =>
    String(t.id) === String(id) ? { ...t, ...dadosAtualizados } : t
  );
  setState(novo);
  salvarDados(novo);
}

