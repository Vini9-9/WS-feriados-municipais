const puppeteer = require('puppeteer');
const fs = require("fs");

async function getFeriadosPorCidade(nomeCidade, siglaEstado){
    return await webScraping(nomeCidade, siglaEstado)
}

async function getFeriadosPorCidades(cidades) {
    for (const cidade of cidades) {
        await getFeriadosPorCidade(cidade)
    }  
}

function formatarURL(nomeCidade, siglaEstado, ano) {
    const pageDefault = "https://calendario.online/feriados-";
    const response = `${pageDefault + nomeCidade}-${siglaEstado}.html`;
    console.log("URL: " + response)
    return response
}

function criarJSON(dados, nomeArquivo) {
    fs.writeFile(nomeArquivo, JSON.stringify(dados, null, 2), err => {
        if(err) throw new Error('Alguma coisa deu errado')
        console.log(`Consegui criar o arquivo ${nomeArquivo}`)
    })
}

async function webScraping(nomeCidade, siglaEstado){
    url = formatarURL(nomeCidade, siglaEstado, 2022)
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    feriadosList = await page.evaluate(() => {
        const nodeList = document.querySelectorAll('#Feriados table tbody:nth-child(3) tr');
        const arrList = [...nodeList];
        const list = [];
        arrList.forEach( el => {
            dados = [...el.childNodes];
            if(dados[1] != undefined && dados[1].childElementCount &&
                dados[1].children[0].outerText == 'Municipal'){

                dataFeriado = dados[0].outerText;
                tipoFeriado = 'Municipal';
                nomeFeriado = dados[3].outerText;
    
                list.push({
                    dataFeriado,
                    tipoFeriado,
                    nomeFeriado
                })
            }
        })

        return list
    });

    await browser.close();
    const feriadosObj = {
        siglaEstado,
        nomeCidade,
        "feriados": feriadosList
    } 
    return feriadosObj
}

async function execute(){
    try {
        const response = fs.readFileSync('./cidades.json', { encoding: 'utf8' });
        const feriadosMunicipais = await getFeriadosPorCidade("Carapebus", "RJ")
        criarJSON(feriadosMunicipais, 'feriado-municipal.json')
    } catch (error) {
        console.error(error);
    }
      
}

execute()