/*
OBJETIVO:
Conectar tudo.

PASSO A PASSO:

1) Capturar inputs do formulário.
2) Escutar clique do botão.
3) Validar dados.
4) Criar objeto transação.
5) Atualizar estado.
6) Re-renderizar UI.
7) Limpar formulário.

IMPORTANTE:
Sempre que adicionar uma transação:
- Atualizar lista
- Atualizar cards

Pergunta:
O que deve acontecer quando a página recarrega?
*/
import { criarEstrutura, renderizarDashboard, onSubmitTransacao, onRemoverTransacao, limparFormulario, } from "./modules/userInterface.js";
import { obterDados } from "./modules/storage.js";
import { setState, getState } from "./modules/state.js";
import { adicionarTransacao, removerTransacao } from "./modules/transactions.js";
// 1) Criar layout
criarEstrutura();
// 2) Carregar dados do localStorage
const dadosGuardados = obterDados();
setState(dadosGuardados);
// 3) Render inicial
renderizarDashboard(getState());
// 4) Quando adiciona
onSubmitTransacao((formData) => {
    const nova = {
        id: String(Date.now()),
        descricao: formData.descricao,
        valor: formData.valor,
        tipo: formData.tipo,
        categoria: formData.categoria,
        dataISO: formData.dataISO,
    };
    adicionarTransacao(nova);
    renderizarDashboard(getState());
    limparFormulario();
});
// 5) Quando remove
onRemoverTransacao((id) => {
    removerTransacao(id);
    renderizarDashboard(getState());
});
