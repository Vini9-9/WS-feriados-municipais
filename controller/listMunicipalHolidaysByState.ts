import puppeteer from 'puppeteer';
import fs from 'fs';
import prompt from 'prompt-sync';
import moment from 'moment';

const currentYear: number = moment().get('year');

async function getHolidaysByCity(nomeCidade: string, siglaEstado: string){
    return await webScraping(nomeCidade, siglaEstado)
}

function formatURL(nomeCidade: string, siglaEstado: string) {
    const pageDefault = "https://calendario.online/feriados-";
    const nomeCidadeFormatado: string = formatarNomeCidade(nomeCidade);
    const response = `${pageDefault + nomeCidadeFormatado}-${siglaEstado}.html`;
    console.log("URL: " + response)
    return response
}

function formatarNomeCidade(nomeCidade: string) {
    var cidadeSemAcento: string = removeAcento(nomeCidade)
    var cidadeSemEspaco: any = cidadeSemAcento.replaceAll(' ','-');
    var cidadeFormatada: string = cidadeSemEspaco.replace(/\'/g, "");
    return cidadeFormatada
}

function removeAcento (text: string)
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

function criarJSON(dados: string, nomeArquivo: string) {
    fs.writeFile('./estados/' + nomeArquivo, JSON.stringify(dados, null, 2), err => {
        if(err) throw new Error('Alguma coisa deu errado')
        console.log(`Consegui criar o arquivo ${nomeArquivo}`)
    })
}

async function webScraping(nomeCidade: string, siglaEstado: string){
    const url: string = formatURL(nomeCidade, siglaEstado)
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    var feriadosList = await page.evaluate(() => {
        const nodeList = document.querySelectorAll('#Feriados table tbody:nth-child(3) tr');
        const arrList = [...nodeList];
        const list: any = [];
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
            let feriadosCidade = await getHolidaysByCity(cidade, sigla)
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

async function listMunicipalHolidaysByState(siglaInformada){
    let siglaEstado = siglaInformada.toUpperCase();
    try {
        const path = `./estados/${currentYear}/feriados-municipais-${siglaEstado}.json`;

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
                // atualizarData
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
console.log("|   Operação listar os feriados municipais de um estado   |");
console.log("============================================================");

const promptSync = prompt();
const siglaEstadoInformado: string = promptSync('Qual a sigla do estado? R.: ');
console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
listMunicipalHolidaysByState(siglaEstadoInformado)