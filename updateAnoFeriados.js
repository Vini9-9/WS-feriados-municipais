const fs = require("fs");
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

function execute(siglaEstado) {
    const filePath = searchForFile("./estados/", `feriados-municipais-${siglaEstado}.json`)
    console.log(filePath)
    cidadesEstadoJSON = fs.readFileSync(filepath, { encoding: 'utf8' });
}

console.log("============================================================");
console.log("| 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO💻  |");
console.log("============================================================");
console.log("|         Operação Atualizar o ano dos feriados            |");
console.log("============================================================");

const siglaEstadoInformado = prompt('Qual a sigla do estado? R.: ');
console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
execute(siglaEstadoInformado)