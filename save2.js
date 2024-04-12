const puppeteer = require('puppeteer');
let titleClose;

// Função para simular atraso
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Função principal para buscar dados de odds
async function fetchOddsData() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://br.betano.com/odds/vila-nova-guarani-sp/46269443/', { waitUntil: 'networkidle2' });
        let close = false;

        console.log('Página carregada com sucesso.');

        // Busca dinâmica dos títulos e dos dados dos odds para múltiplos elementos
        const results = await page.evaluate(async () => {
            const sections = document.querySelectorAll('.tw-mb-n.tw-px-n.tw-py-xs.tw-bg-white-snow.tw-text-n-13-steel');
            const data = [];

            for (const section of sections) {
                const titleSelector = '.tw-text-s.tw-leading-s.tw-tracking-s.tw-flex-1.tw-flex.tw-items-center.tw-py-s';
                const titleElement = section.querySelector(titleSelector);
                const title = titleElement ? titleElement.textContent.trim() : 'Título não encontrado';

                // if(title === 'Empate Anula'){
                //     close = true;
                // }

                // if (close == true) {
                //     // Simula o clique e espera
                //     titleElement.click(); // Esta chamada não funcionará dentro do evaluate sem uma função de clique externa
                //     await new Promise(resolve => setTimeout(resolve, 1200)); // Espera 1,2 segundos
                // }

                const odds = {};
                const selections = section.querySelectorAll('.selections__selection');
                selections.forEach((selection) => {
                    const optionTitle = selection.querySelector('.selections__selection__title span')?.textContent.trim();
                    const oddValue = selection.querySelector('.selections__selection__odd')?.textContent.trim();
    
                    if(oddValue == ""){
                        titleClose = optionTitle;
                    }
                    if (optionTitle && oddValue) {
                        odds[optionTitle] = oddValue;
                    }
                });

                data.push({ title, odds });
            }

            for(let i = 0; i < data.length; i++){
                if(Object.keys(data[i].odds).length === 0){
                    return data[i].title;
                }
            }

            return data;
        });

        console.log('Resultados:', results);
        let resultTest = await results;

        await browser.close();
    } catch (error) {
        console.error('Erro durante a execução do script:', error);
    }
}

// Chamada da função para buscar dados
fetchOddsData();