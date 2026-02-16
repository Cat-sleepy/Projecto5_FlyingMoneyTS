// 1. Criar a estrutura da interface que 
// sera usada no app.js
export function criarEstrutura() {

    // 2. Criamos uma constante para armazenar o container 
    // capturado do HTML
    const container = document.querySelector("#app");

    //3. Criamos o input que vai coletar os dados 
    // digitados pelo utilizador na página web.
    const input = document.createElement("input");
    input.type = "number";
    input.id = "numero";
    input.placeholder = "Digite um número";

    // 4. Criamos o botão que vai acionar a função 
    // de dobrar o número digitado.
    const botao = document.createElement("button");
    botao.textContent = "Dobrar";
    botao.id = "btnDobrar";

    // 5. Criamos um título para o histórico de operações.
    const titulo = document.createElement("h3");
    titulo.textContent = "Histórico";

    // 6. Agora vamos criar uma lista que será 
    // renderizada na interface para mostrar 
    // o histórico de operações.
    const lista = document.createElement("ul");
    lista.id = "lista";

    container.appendChild(input);
    container.appendChild(botao);
    container.appendChild(titulo);
    container.appendChild(lista);
}

// 7. Criar uma função para renderizar o histórico de 
// operações na interface. Essa função recebe os dados 
// do histórico como parâmetro e atualiza a lista na 
// interface com os valores correspondentes.
export function renderizarHistorico(dados) {

    const lista = document.querySelector("#lista");

    lista.innerHTML = "";

    dados.forEach(item => {

        const li = document.createElement("li");
        li.textContent = `${item.original} → ${item.resultado}`;

        lista.appendChild(li);
    });
}
