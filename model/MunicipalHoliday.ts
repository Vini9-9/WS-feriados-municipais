import { Holiday } from "./Holiday";

export interface MunicipalHoliday {
    siglaEstado: string,
    nomeCidade: string,
    feriados: Holiday[]
}