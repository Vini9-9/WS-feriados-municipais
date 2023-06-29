import fs from "fs";
import moment from "moment/moment";
import path from 'path';
import prompt from 'prompt-sync';

function searchForFile(directory: string, fileName: string): string | null {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const foundFilePath = searchForFile(filePath, fileName);
      if (foundFilePath) {
        return foundFilePath;
      }
    } else if (file === fileName) {
      return path.join(directory, fileName);
    }
  }

  return null;
}

function replaceTextInJSONFile(
  filePath: string, searchText: string, replacementText: string 
  ): string {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const updatedData = fileData.replace(new RegExp(searchText, 'g'), replacementText);
    return updatedData;
}

function getYearFolder (dir: string, filePath: string): string {
    const pureDir = dir.replace(/[./]/g, '');
    return filePath.slice(pureDir.length + 1, pureDir.length + 5);
}

function saveOnCorrectFolder(outputDirectory: string, modifiedData: string) {
    fs.writeFileSync(outputDirectory, modifiedData, 'utf8')
}


function execute(siglaEstado: string) {
    const dir = "./estados/";
    const filename = `feriados-municipais-${siglaEstado}.json`;
    const filePath = searchForFile(dir, filename)

    if(filePath){
        const yearFolder = getYearFolder(dir, filePath);
        const currentYear = moment().get('year').toString();
        const updatedData = replaceTextInJSONFile(filePath, yearFolder, currentYear);
        const dirToSave = path.join(dir, `${currentYear}`, filename);
        saveOnCorrectFolder(dirToSave, updatedData)
        console.log(`Atualizado feriados de "${yearFolder}" para "${currentYear}"`);
    } else {
        console.log(`O arquivo JSON  "${filename}" não foi encontrado no diretorio especificado.`);
        console.log(`Operação listar os feriados municipais do "${siglaEstado}" ...`)
        // getAllMunHolidaysByState(siglaEstado)
    }
    
}

console.log("============================================================");
console.log(" 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO 💻   ");
console.log("============================================================");
console.log("         Operação Atualizar o ano dos feriados              ");
console.log("============================================================");

const promptSync = prompt();
const siglaEstadoInformado: string = promptSync('Qual a sigla do estado? R.:');
console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
execute(siglaEstadoInformado.toUpperCase())