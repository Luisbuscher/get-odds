const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Habilitar o CORS
app.use(cors());

async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

app.get('/scrape', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://br.betano.com/odds/vila-nova-guarani-sp/46269443/', { waitUntil: 'networkidle2' });
        let close = false;

        console.log('Página carregada com sucesso.');

        // await sleep(40000);

        // Busca dinâmica dos títulos e dos dados dos odds para múltiplos elementos
        const results = await page.evaluate(async () => {
            const sections = document.querySelectorAll('.tw-mb-n.tw-px-n.tw-py-xs.tw-bg-white-snow.tw-text-n-13-steel');
            const data = [];

            for (const section of sections) {
                const titleSelector = '.tw-text-s.tw-leading-s.tw-tracking-s.tw-flex-1.tw-flex.tw-items-center.tw-py-s';
                const titleElement = section.querySelector(titleSelector);
                const title = titleElement ? titleElement.textContent.trim() : 'Título não encontrado';

                if(title === 'Empate Anula'){
                    close = true;
                }

                if (close == true) {
                    // Precisa simular o clique e esperar
                    titleElement.click(); // Isso não vai funcionar dentro do evaluate sem uma função de clique externa
                    await new Promise(resolve => setTimeout(resolve, 1200)); // Espera 1,2 segundos
                }

                const odds = {};
                const selections = section.querySelectorAll('.selections__selection');
                selections.forEach((selection) => {
                    const optionTitle = selection.querySelector('.selections__selection__title span')?.textContent.trim();
                    const oddValue = selection.querySelector('.selections__selection__odd')?.textContent.trim();
                    if (optionTitle && oddValue) {
                        odds[optionTitle] = oddValue;
                    }
                });

                data.push({ title, odds });
            }

            return data;
        });

        console.log('Resultados:', results);

        await browser.close();

        // Enviar os resultados para o frontend
        res.json(results);
    } catch (error) {
        console.error('Erro durante a execução do script:', error);
        res.status(500).send('Erro durante a execução do script');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
