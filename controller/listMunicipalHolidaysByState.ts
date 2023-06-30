import prompt from 'prompt-sync';
import { HolidayService } from '../service/HolidayService';

const holidayService = new HolidayService();

function main() {

    holidayService.showBannerListMunicipalHolidayByState();
    const promptSync = prompt();
    const siglaEstadoInformado: string = promptSync('Qual a sigla do estado? R.: ');
    console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
    holidayService.listMunicipalHolidaysByState(siglaEstadoInformado)
}


main();
