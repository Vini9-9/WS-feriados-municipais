import fs from "fs";
import path from "path";
import moment from "moment/moment";

export class HolidayService {
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
    const filePath = this.searchForFile(dir, filename)

    if(filePath){
        const yearFolder = this.getYearFolder(dir, filePath);
        const currentYear = moment().get('year').toString();
        const updatedData = this.replaceTextInJSONFile(filePath, yearFolder, currentYear);
        const dirToSave = path.join(dir, `${currentYear}`, filename);
        this.saveOnCorrectFolder(dirToSave, updatedData)
        console.log(`Atualizado feriados de "${yearFolder}" para "${currentYear}"`);
    } else {
        console.log(`O arquivo JSON  "${filename}" não foi encontrado no diretorio especificado.`);
        console.log(`Operação listar os feriados municipais do "${siglaEstado}" ...`)
        // await listMunicipalHolidaysByState(siglaEstado)
    }
    
}
}
