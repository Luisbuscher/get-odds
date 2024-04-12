// IMPORTS E CLASSES:
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const puppeteer = require('puppeteer');
const { title } = require('process');

let titleEmptyOdd;

async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function getOdds(url, socket, titleEmptyOdd) {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

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

                if (title == "Empate Anula") {
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
        // console.log("TOTAL DE LENGTH: " + results.length);
        // console.log("TOTAL DE QTD ODD ULTIMA: " + Object.keys(results[30].odds).length);

        // Verificar se há odds vazias e imprimir o título correspondente.
        // const emptyOddsTitle = results.find(result => Object.keys(result.odds).length === 0);
        // if (emptyOddsTitle) {
        //     console.log('Primeiro título com odds vazias:', emptyOddsTitle.title);
        //     await browser.close();
        //     return emptyOddsTitle.title;
        // }

        socket.emit('sendOdds', results);

        await browser.close();
    } catch (error) {
        console.error('Erro durante a execução do script:', error);
    }
}

io.on('connection', (socket) => {

    // Recebe a URL do front-end.
    socket.on('urlOdds', async (url) => {
        console.log("Recebida pelo servidor a URL: " + url);
        // Primeiro verifica qual titulo comeca a ocultar as odds.
        titleEmptyOdd = await getOdds(url, socket);
        // console.log("Ja recebi pelo socket qual titulo começa vazio: "+titleEmptyOdd)
        // // Executa de fato a função para obter as odds.
        // await getOdds(url, socket, titleEmptyOdd);
    });

});

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

const port = 3000;

server.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
});