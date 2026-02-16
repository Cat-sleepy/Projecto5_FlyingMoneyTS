// Crio uma chave para armazenar os dados no localStorage. 
// Essa chave é usada para identificar os dados 
// relacionados ao histórico de operações.
const CHAVE = "historico";

// 1. Criar uma função para obter os dados do 
// localStorage usando a chave definida.
export function obterDados() {
    // 2. A função tenta recuperar os dados do 
    // localStorage usando a chave.
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
}

export function salvarDados(dados) {
    // 3. A função converte os dados para uma string JSON
    localStorage.setItem(CHAVE, JSON.stringify(dados));
}
