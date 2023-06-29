const puppeteer = require('puppeteer');
const fs = require("fs");
const prompt = require('prompt-sync')();

async function getFeriadosPorCidade(nomeCidade, siglaEstado){
    return await webScraping(nomeCidade, siglaEstado)
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
    cidadeSemEspaco = cidadeSemAcento.replaceAll(' ','-');
    cidadeFormatada = cidadeSemEspaco.replace(/\'/g, "");
    return cidadeFormatada
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
    fs.writeFile('./estados/' + nomeArquivo, JSON.stringify(dados, null, 2), err => {
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

async function getFeriadosPorEstado(dadosEstado) {
    listFeriadosEstado = []
    sigla = dadosEstado.sigla
    cidades = dadosEstado.cidades
    for (const cidade of cidades) {
        console.log('** GERANDO FERIADOS DA CIDADE: ', cidade + '-' + sigla)
        try {
            let feriadosCidade = await getFeriadosPorCidade(cidade, sigla)
            listFeriadosEstado.push(feriadosCidade)
        } catch (error) {
            console.log(error)
            return listFeriadosEstado
        }
        
    }  
    
    return listFeriadosEstado;
}

function filtrarDadosEstado(dados, siglaEstado) {
    return dados.filter((el) => {
        return el.sigla == siglaEstado; 
    })
}

async function execute(siglaInformada){
    let siglaEstado = siglaInformada.toUpperCase();
    try {
        const path = `./estados/feriados-municipais-${siglaEstado}.json`;

        cidadesJSON = fs.readFileSync('./cidades.json', { encoding: 'utf8' });
        const dados = JSON.parse(cidadesJSON);
        var dadosEstado = filtrarDadosEstado(dados, siglaEstado)[0];

        if (fs.existsSync(path)) {  
            console.log("Localizei um JSON referente a esse estado, vou atualizá-lo")
            cidadesEstadoJSON = fs.readFileSync(path, { encoding: 'utf8' });
            const cidadesRealizadas = JSON.parse(cidadesEstadoJSON);
            const qtdCidadesRealizadas = cidadesRealizadas.length;
            var cidadesEstado = dadosEstado.cidades;

            if(qtdCidadesRealizadas == cidadesEstado.length){
                console.log("O arquivo JSON já tem todas as cidades.")
                return
            } 

            var cidadesEstadoRestantes = cidadesEstado.slice(qtdCidadesRealizadas, 
                cidadesEstado.length);

            dadosEstado = {
                sigla: siglaEstado, 
                cidades: cidadesEstadoRestantes
            }
            novosferiadosMunicipais = await getFeriadosPorEstado(dadosEstado)
            feriadosMunicipais = cidadesRealizadas.concat(novosferiadosMunicipais);

            
        } else {
            feriadosMunicipais = await getFeriadosPorEstado(dadosEstado)
        }

        criarJSON(feriadosMunicipais, `feriados-municipais-${siglaEstado}.json`)
        
    } catch (error) {
        console.error(error);
        return
    }
      
}

console.log("============================================================");
console.log("| 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO💻 |");
console.log("============================================================");

const siglaEstadoInformado = prompt('Qual a sigla do estado? R.:');
console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
execute(siglaEstadoInformado)