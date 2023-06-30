import fs from "fs";
import path from "path";
import moment from "moment/moment";
import { State } from "../model/State";
import { MunicipalHoliday } from "../model/MunicipalHoliday";
import { Holiday } from "../model/Holiday";
import puppeteer from "puppeteer";

export class HolidayService {
  currentYear: number = moment().get("year");

  constructor() {}

  searchForFile(directory: string, fileName: string): string | null {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        const foundFilePath = this.searchForFile(filePath, fileName);
        if (foundFilePath) {
          return foundFilePath;
        }
      } else if (file === fileName) {
        return path.join(directory, fileName);
      }
    }

    return null;
  }

  replaceTextInJSONFile(
    filePath: string,
    searchText: string,
    replacementText: string
  ): string {
    const fileData = fs.readFileSync(filePath, "utf8");
    const updatedData = fileData.replace(
      new RegExp(searchText, "g"),
      replacementText
    );
    return updatedData;
  }

  getYearFolder(dir: string, filePath: string): string {
    const pureDir = dir.replace(/[./]/g, "");
    return filePath.slice(pureDir.length + 1, pureDir.length + 5);
  }

  saveOnCorrectFolder(outputDirectory: string, modifiedData: string) {
    fs.writeFileSync(outputDirectory, modifiedData, "utf8");
  }

  updateYearHoliday(siglaEstado: string) {
    const dir = "./estados/";
    const filename = `feriados-municipais-${siglaEstado}.json`;
    const filePath = this.searchForFile(dir, filename);

    if (filePath) {
      const yearFolder = this.getYearFolder(dir, filePath);
      const currentYear = moment().get("year").toString();
      const updatedData = this.replaceTextInJSONFile(
        filePath,
        yearFolder,
        currentYear
      );
      const dirToSave = path.join(dir, `${currentYear}`, filename);
      this.saveOnCorrectFolder(dirToSave, updatedData);
      console.log(
        `Atualizado feriados de "${yearFolder}" para "${currentYear}"`
      );
    } else {
      console.log(
        `O arquivo JSON "${filename}" não foi encontrado no diretorio especificado.`
      );
      console.log(
        `Operação listar os feriados municipais de "${siglaEstado}" ...`
      );
      this.listMunicipalHolidaysByState(siglaEstado);
    }
  }

  filterStateData(dados: State[], siglaEstado: string) {
    return dados.filter((el) => {
      return el.sigla == siglaEstado;
    });
  }

  async getHolidaysByState(dadosEstado: State) {
    var listFeriadosEstado: MunicipalHoliday[] = [];
    const sigla: string = dadosEstado.sigla;
    const cidades: string[] = dadosEstado.cidades;
    for (const cidade of cidades) {
      console.log("** GERANDO FERIADOS DA CIDADE: ", cidade + "-" + sigla);
      try {
        let feriadosCidade = await this.getHolidaysByCity(cidade, sigla);
        listFeriadosEstado.push(feriadosCidade);
      } catch (error) {
        console.log(error);
        return listFeriadosEstado;
      }
    }

    return listFeriadosEstado;
  }

  createJSON(dados: MunicipalHoliday[], nomeArquivo: string) {
    console.log("currentYear", this.currentYear);
    fs.writeFile(
      `./estados/${this.currentYear}/${nomeArquivo}`,
      JSON.stringify(dados, null, 2),
      (err) => {
        if (err) throw new Error("Alguma coisa deu errado");
        console.log(`Consegui criar o arquivo ${nomeArquivo}`);
      }
    );
  }

  removeAccentuation(text: string) {
    text = text.toLowerCase();
    text = text.replace(new RegExp("[ÁÀÂÃ]", "gi"), "a");
    text = text.replace(new RegExp("[ÉÈÊ]", "gi"), "e");
    text = text.replace(new RegExp("[ÍÌÎ]", "gi"), "i");
    text = text.replace(new RegExp("[ÓÒÔÕ]", "gi"), "o");
    text = text.replace(new RegExp("[ÚÙÛ]", "gi"), "u");
    text = text.replace(new RegExp("[Ç]", "gi"), "c");
    return text;
  }

  async getHolidaysByCity(nomeCidade: string, siglaEstado: string) {
    return await this.webScraping(nomeCidade, siglaEstado);
  }

  formatURL(nomeCidade: string, siglaEstado: string) {
    const pageDefault = "https://calendario.online/feriados-";
    const nomeCidadeFormatado: string = this.formatCityName(nomeCidade);
    const response = `${pageDefault + nomeCidadeFormatado}-${siglaEstado}.html`;
    console.log("URL: " + response);
    return response;
  }

  formatCityName(nomeCidade: string) {
    const cidadeSemAcento: string = this.removeAccentuation(nomeCidade);
    const cidadeSemEspaco: string = cidadeSemAcento.replace(/ /g, "-");
    const cidadeFormatada: string = cidadeSemEspaco.replace(/'/g, "");
    return cidadeFormatada;
  }

  async webScraping(nomeCidade: string, siglaEstado: string) {
    const url: string = this.formatURL(nomeCidade, siglaEstado);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const feriadosList = await page.evaluate(() => {
      const nodeList = document.querySelectorAll(
        "#Feriados table tbody:nth-child(3) tr"
      );
      const arrList = Array.from(nodeList);
      const list: Holiday[] = [];
      arrList.forEach((el) => {
        const dados = Array.from(el.childNodes);
        if (
          dados[1] != undefined &&
          dados[1] instanceof Element && // Check if it's an Element node
          dados[1].childElementCount &&
          dados[1].children[0].textContent === "Municipal"
        ) {
          const dataFeriado: string = dados[0].textContent || "";
          const tipoFeriado: string = "Municipal";
          const nomeFeriado: string = dados[3].textContent || "";

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

  async listMunicipalHolidaysByState(siglaInformada: string) {
    let siglaEstado = siglaInformada.toUpperCase();
    try {
      const path = `./estados/${this.currentYear}/feriados-municipais-${siglaEstado}.json`;

      var cidadesJSON: string = fs.readFileSync("./cidades.json", {
        encoding: "utf8",
      });
      const dados: State[] = JSON.parse(cidadesJSON);
      var dadosEstado: State = this.filterStateData(dados, siglaEstado)[0];

      if(dadosEstado == undefined){
        console.error(
          "Sigla do estado não localizada :("
        );
        return
      }

      if (fs.existsSync(path)) {
        console.log(
          "Localizei um JSON referente a esse estado, vou atualizá-lo"
        );
        var cidadesEstadoJSON: string = fs.readFileSync(path, {
          encoding: "utf8",
        });
        const cidadesRealizadas: MunicipalHoliday[] =
          JSON.parse(cidadesEstadoJSON);
        const qtdCidadesRealizadas = cidadesRealizadas.length;
        var cidadesEstado = dadosEstado.cidades;
        var feriadosMunicipais: MunicipalHoliday[] = [];

        if (qtdCidadesRealizadas == cidadesEstado.length) {
          console.log("O arquivo JSON já tem todas as cidades.");
          console.log("Vou atualizar as datas ...");
          this.updateYearHoliday(siglaInformada);
          return;
        }

        var cidadesEstadoRestantes = cidadesEstado.slice(
          qtdCidadesRealizadas,
          cidadesEstado.length
        );

        dadosEstado = {
          sigla: siglaEstado,
          cidades: cidadesEstadoRestantes,
        };
        var novosferiadosMunicipais: MunicipalHoliday[] =
          await this.getHolidaysByState(dadosEstado);
        feriadosMunicipais = cidadesRealizadas.concat(novosferiadosMunicipais);
      } else {
        feriadosMunicipais = await this.getHolidaysByState(dadosEstado);
      }

      this.createJSON(
        feriadosMunicipais,
        `feriados-municipais-${siglaEstado}.json`
      );
    } catch (error) {
      console.error(error);
      return;
    }
  }

  showBannerListMunicipalHolidayByState() {
    console.log("============================================================");
    console.log("| 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO💻 |");
    console.log("============================================================");
    console.log("|   Operação listar os feriados municipais de um estado   |");
    console.log("============================================================");
  }

  showBannerUpdateYear() {
    console.log("============================================================");
    console.log(" 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO 💻   ");
    console.log("============================================================");
    console.log("         Operação Atualizar o ano dos feriados              ");
    console.log("============================================================");
  }
}
