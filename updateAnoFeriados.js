const fs = require("fs");
const moment = require("moment/moment");
const path = require('path');
const prompt = require('prompt-sync')();

function searchForFile(directory, fileName) {
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

  console.log(`The JSON file "${fileName}" was not found in any child folder of the specified directory.`);
  return null;
}

function replaceTextInJSONFile(filePath, searchText, replacementText) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const updatedData = fileData.replace(new RegExp(searchText, 'g'), replacementText);
    return updatedData;
}

function getYearFolder (dir, filePath) {
    const pureDir = dir.replace(/[./]/g, '');
    return filePath.slice(pureDir.length + 1, pureDir.length + 5);
}

function saveOnCorrectFolder(outputDirectory, modifiedData) {
    fs.writeFileSync(outputDirectory, modifiedData, 'utf8')
}


function execute(siglaEstado) {
    const dir = "./estados/";
    const filename = `feriados-municipais-${siglaEstado}.json`;
    const filePath = searchForFile(dir, filename)
    const yearFolder = getYearFolder(dir, filePath);
    const currentYear = moment().get('year');

    if(filePath){
        const updatedData = replaceTextInJSONFile(filePath, yearFolder, currentYear);
        const dirToSave = path.join(dir, `${currentYear}`, filename);
        saveOnCorrectFolder(dirToSave, updatedData)
        console.log(`Atualizado feriados de "${yearFolder}" para "${currentYear}"`);
    } else {
        // criarArquivo current Year
        console.log("Criando novo arquivo...")
    }
    
}

console.log("============================================================");
console.log("| 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO💻  |");
console.log("============================================================");
console.log("|         Operação Atualizar o ano dos feriados            |");
console.log("============================================================");

const siglaEstadoInformado = prompt('Qual a sigla do estado? R.: ');
console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
execute(siglaEstadoInformado)