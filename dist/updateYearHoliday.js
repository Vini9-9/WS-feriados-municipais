"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment/moment"));
const path_1 = __importDefault(require("path"));
const prompt_sync_1 = __importDefault(require("prompt-sync"));
function searchForFile(directory, fileName) {
    const files = fs_1.default.readdirSync(directory);
    for (const file of files) {
        const filePath = path_1.default.join(directory, file);
        const stats = fs_1.default.statSync(filePath);
        if (stats.isDirectory()) {
            const foundFilePath = searchForFile(filePath, fileName);
            if (foundFilePath) {
                return foundFilePath;
            }
        }
        else if (file === fileName) {
            return path_1.default.join(directory, fileName);
        }
    }
    return null;
}
function replaceTextInJSONFile(filePath, searchText, replacementText) {
    const fileData = fs_1.default.readFileSync(filePath, 'utf8');
    const updatedData = fileData.replace(new RegExp(searchText, 'g'), replacementText);
    return updatedData;
}
function getYearFolder(dir, filePath) {
    const pureDir = dir.replace(/[./]/g, '');
    return filePath.slice(pureDir.length + 1, pureDir.length + 5);
}
function saveOnCorrectFolder(outputDirectory, modifiedData) {
    fs_1.default.writeFileSync(outputDirectory, modifiedData, 'utf8');
}
function execute(siglaEstado) {
    const dir = "./estados/";
    const filename = `feriados-municipais-${siglaEstado}.json`;
    const filePath = searchForFile(dir, filename);
    if (filePath) {
        const yearFolder = getYearFolder(dir, filePath);
        const currentYear = (0, moment_1.default)().get('year').toString();
        const updatedData = replaceTextInJSONFile(filePath, yearFolder, currentYear);
        const dirToSave = path_1.default.join(dir, `${currentYear}`, filename);
        saveOnCorrectFolder(dirToSave, updatedData);
        console.log(`Atualizado feriados de "${yearFolder}" para "${currentYear}"`);
    }
    else {
        console.log(`O arquivo JSON  "${filename}" não foi encontrado no diretorio especificado.`);
        console.log("Listando os feriados municicipais ...");
        // getAllMunHolidaysByState(siglaEstado)
    }
}
console.log("============================================================");
console.log(" 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO 💻   ");
console.log("============================================================");
console.log("         Operação Atualizar o ano dos feriados              ");
console.log("============================================================");
const promptSync = (0, prompt_sync_1.default)();
const siglaEstadoInformado = promptSync('Qual a sigla do estado? R.:');
console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
execute(siglaEstadoInformado);
