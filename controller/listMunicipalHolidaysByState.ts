import puppeteer from 'puppeteer';
import fs from 'fs';
import prompt from 'prompt-sync';
import moment from 'moment';
import { Holiday } from '../model/Holiday';
import { State } from '../model/State';
import { MunicipalHoliday } from '../model/MunicipalHoliday';

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
    const cidadeSemAcento: string = removeAcento(nomeCidade);
    const cidadeSemEspaco: string = cidadeSemAcento.replace(/ /g, '-');
    const cidadeFormatada: string = cidadeSemEspaco.replace(/'/g, '');
    return cidadeFormatada;
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

function criarJSON(dados: MunicipalHoliday[], nomeArquivo: string) {
    console.log("currentYear", currentYear)
    fs.writeFile(`./estados/${currentYear}/${nomeArquivo}`, JSON.stringify(dados, null, 2), err => {
        if(err) throw new Error('Alguma coisa deu errado')
        console.log(`Consegui criar o arquivo ${nomeArquivo}`)
    })
}

async function webScraping(nomeCidade: string, siglaEstado: string) {
    const url: string = formatURL(nomeCidade, siglaEstado);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const feriadosList = await page.evaluate(() => {
      const nodeList = document.querySelectorAll('#Feriados table tbody:nth-child(3) tr');
      const arrList = Array.from(nodeList);
      const list: Holiday[] = [];
      arrList.forEach(el => {
        const dados = Array.from(el.childNodes);
        if (
          dados[1] != undefined &&
          dados[1] instanceof Element && // Check if it's an Element node
          dados[1].childElementCount &&
          dados[1].children[0].textContent === 'Municipal'
        ) {
          const dataFeriado: string = dados[0].textContent || "";
          const tipoFeriado: string = 'Municipal';
          const nomeFeriado: string  = dados[3].textContent || "";
  
          list.push({
            dataFeriado,
            tipoFeriado,
            nomeFeriado,
          });
        }
      });
  
      return list;
    });
  
    await browser.close();
    const feriadosObj: MunicipalHoliday = {
      siglaEstado,
      nomeCidade,
      feriados: feriadosList,
    };
    return feriadosObj;
  }
  

async function getFeriadosPorEstado(dadosEstado: State) {
    var listFeriadosEstado: MunicipalHoliday[] = []
    const sigla: string = dadosEstado.sigla
    const cidades: string[] = dadosEstado.cidades
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

function filtrarDadosEstado(dados: State[], siglaEstado: string) {
    return dados.filter((el) => {
        return el.sigla == siglaEstado; 
    })
}

async function listMunicipalHolidaysByState(siglaInformada: string){
    let siglaEstado = siglaInformada.toUpperCase();
    try {
        const path = `./estados/${currentYear}/feriados-municipais-${siglaEstado}.json`;

        var cidadesJSON: string = fs.readFileSync('./cidades.json', { encoding: 'utf8' });
        const dados: State[] = JSON.parse(cidadesJSON);
        var dadosEstado: State = filtrarDadosEstado(dados, siglaEstado)[0];

        if (fs.existsSync(path)) {  
            console.log("Localizei um JSON referente a esse estado, vou atualizá-lo")
            var cidadesEstadoJSON: string = fs.readFileSync(path, { encoding: 'utf8' });
            const cidadesRealizadas: MunicipalHoliday[] = JSON.parse(cidadesEstadoJSON);
            const qtdCidadesRealizadas = cidadesRealizadas.length;
            var cidadesEstado = dadosEstado.cidades;
            var feriadosMunicipais: MunicipalHoliday[] = [];

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
            var novosferiadosMunicipais: MunicipalHoliday[] = await getFeriadosPorEstado(dadosEstado)
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
listMunicipalHolidaysByState(siglaEstadoInformado.toUpperCase())