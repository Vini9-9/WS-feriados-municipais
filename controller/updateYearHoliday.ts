import prompt from 'prompt-sync';
import { HolidayService } from '../service/HolidayService';

const holidayService = new HolidayService();

async function main() {
  holidayService.showBannerUpdateYear()
  const promptSync = prompt();
  const siglaEstadoInformado: string = promptSync('Qual a sigla do estado? R.:');
  console.log(`LOG: Sigla informada: ${siglaEstadoInformado}`);
  holidayService.updateYearHoliday(siglaEstadoInformado.toUpperCase());

  try {
    // await updateYearHoliday(siglaEstadoInformado.toUpperCase());
    
  } catch (error: any) {
    console.log(`Ocorreu um erro: ${error.message}`);
  }
}

main();
