import { dobrar } from "./dobrar/dobrar.js";
import { obterDados, salvarDados } from "./storage/storage.js";
import { criarEstrutura, renderizarHistorico } from "./userInterface/userInterface.js";

// 1. Criar interface
criarEstrutura();

// 2. Carregar dados
let historico = obterDados();

// 3. Mostrar histórico ao iniciar
renderizarHistorico(historico);

// 4. capturar input
const input = document.querySelector("#numero");
// 5. Capturar botão
const botao = document.querySelector("#btnDobrar");

// 6. adicionar um evento no botão para capturar o valor do input 
botao.addEventListener("click", () => {

    const valor = Number(input.value);

    if (!valor) {
        alert("Digite um número válido");
        return;
    }

    // 7. Salvo o resultado dobrado na const resultado
    const resultado = dobrar(valor);

    // 8. Criar um objeto com o valor original e o resultado
    const registro = {
        original: valor,
        resultado: resultado
    };

    // 9. Adicionar o objeto ao histórico
    historico.push(registro);

    // 10. Salvar o histórico atualizado no localStorage
    salvarDados(historico);

    // 11. Renderizar o histórico atualizado na interface
    renderizarHistorico(historico);

    // 12. Limpar o valor do input
    input.value = "";
});
