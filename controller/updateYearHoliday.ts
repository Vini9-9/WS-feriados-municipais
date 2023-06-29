import fs from "fs";
import moment from "moment/moment";
import path from 'path';
import prompt from 'prompt-sync';
import { listMunicipalHolidaysByState } from './listMunicipalHolidaysByState';
import { HolidayService } from '../service/HolidayService';

const holidayService = new HolidayService();

async function main() {
  console.log("============================================================");
  console.log(" 💻 BEM VINDO AO WS DE FERIADOS MUNICIPAIS POR ESTADO 💻   ");
  console.log("============================================================");
  console.log("         Operação Atualizar o ano dos feriados              ");
  console.log("============================================================");

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
