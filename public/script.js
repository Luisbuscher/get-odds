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

        // Cria inputs para cada probabilidade dentro do objeto de odds
        for (const [key, value] of Object.entries(item.odds)) {
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('value', value);
            input.setAttribute('data-key', key); // Adiciona um atributo para identificar a odd
            containerDiv.appendChild(document.createTextNode(`${key}: `)); // Adiciona o texto da chave
            containerDiv.appendChild(input); // Adiciona o input
            containerDiv.appendChild(document.createElement('br')); // Adiciona uma quebra de linha
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
    const modifiedData = []; // Array para armazenar os dados modificados

    // Itera sobre todos os containers de apostas
    $('.container').each(function() {
        const oddsData = {}; // Objeto para armazenar as odds modificadas
        const title = $(this).find('h2').text(); // Título da aposta

        // Itera sobre os inputs dentro do container
        $(this).find('input').each(function() {
            const key = $(this).data('key'); // Chave da odd
            const value = $(this).val(); // Valor do input

            oddsData[key] = value; // Adiciona a odd ao objeto de odds
        });

        // Adiciona os dados modificados ao array
        modifiedData.push({ title: title, odds: oddsData });
    });

    // Exibe os dados modificados no console para verificar
    console.log(modifiedData);

    // Agora você pode enviar os dados modificados para onde precisar, como via socket ou AJAX
});