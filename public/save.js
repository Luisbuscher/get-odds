var socket = io();

$('#saveData').hide();
$('#load').hide();

function createDivBet(resultData) {
    $('#load').hide();
    // Limpa o conteúdo existente antes de adicionar novos elementos
    document.getElementById('container').innerHTML = '';

    // Itera sobre os dados recebidos
    resultData.forEach(item => {
        // Cria o elemento container div e define sua classe
        const containerDiv = document.createElement('div');
        containerDiv.setAttribute('class', 'container text-center');

        // Cria o elemento h2, define seu estilo e texto com o título
        const header = document.createElement('h2');
        header.style.fontSize = '15pt';
        header.innerText = item.title;

        // Adiciona o elemento h2 ao container div
        containerDiv.appendChild(header);

        // Cria um parágrafo para cada probabilidade dentro do objeto de odds
        for (const [key, value] of Object.entries(item.odds)) {
            const paragraph = document.createElement('p');
            paragraph.innerText = `${key}: ${value}`;
            containerDiv.appendChild(paragraph);
        }

        // Adiciona o container div ao corpo do documento
        document.getElementById('container').appendChild(containerDiv);
    });

    $('#saveData').show();
}

$('#search').on('click', () => {
    $('#load').show();
    $(".container").hide();
    let url = $("#url").val();
    if(!url){ return alert("Insira uma url") }
    socket.emit('urlOdds', url); // https://br.betano.com/odds/vila-nova-guarani-sp/46269443/
});

socket.on('sendOdds', (data) => {
    console.log("Recebido no sendOdds");
    createDivBet(data);
});

$('#saveData').on('click', () => {
    //
});