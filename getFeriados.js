const puppeteer = require('puppeteer');
const fs = require("fs");
const prompt = require('prompt-sync')();

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
    nomeCidadeFormatado = formatarNomeCidade(nomeCidade);
    const response = `${pageDefault + nomeCidadeFormatado}-${siglaEstado}.html`;
    console.log("URL: " + response)
    return response
}

function formatarNomeCidade(nomeCidade) {
    cidadeSemAcento = removeAcento(nomeCidade)
    return cidadeSemAcento.replaceAll(' ','-');
}

function removeAcento (text)
{       
    text = text.toLowerCase();                                                         
    text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replace(new RegExp('[Ç]','gi'), 'c');
    return text;                 
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

async function execute(siglaEstado, cidade){
    try {
        // siglaEstadoInformado = "SP"; //informe a sigla do estado aqui
        // cidadeInformada = "São Bernardo do Campo"; //informe a cidade aqui
        const response = fs.readFileSync('./cidades.json', { encoding: 'utf8' });
        const feriadosMunicipais = await getFeriadosPorCidade(cidade, siglaEstado)
        criarJSON(feriadosMunicipais, 'feriado-municipal.json')
    } catch (error) {
        console.error(error);
    }
      
}

console.log("================================================");
console.log("| 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS 💻 |");
console.log("================================================");

const siglaEstadoInformado = prompt('Qual a sigla do estado onde fica a cidade? R.:');
console.log(`Sigla informada: ${siglaEstadoInformado}`);
const cidadeInformada = prompt('Qual o nome da cidade? R.:');
console.log(`Cidade informada: ${cidadeInformada}`);
execute(siglaEstadoInformado, cidadeInformada)