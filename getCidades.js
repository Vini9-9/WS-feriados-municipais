const axios = require("axios");
const fs = require("fs");

const apiEstados = axios.create({
  baseURL: "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
});

async function getEstados () {
    
    const result = await apiEstados.get()
    .then((response) => {
        return response.data
    })
    .catch((error) => {
        return error.response.data
    });

    return result

}

//var apiCidades =  apiEstados + UF + '/municipios'
async function getCidades (UF) {
    const response = await apiEstados.get(`/${UF}/municipios`)
    .then((response) => {
        return formatarNomes(response.data)
    })
    .catch((error) => {
        return error.response.data
    });
    return response;
}

async function getTodasAsCidades (estados) {
    var todasAsCidades = [];

    for (const estado of estados) {
        let cidades = await getCidades(estado.sigla)
        todasAsCidades.push(
            {
                "sigla": estado.sigla,
                "cidades": cidades
            })    
    }

    return todasAsCidades;

}

function formatarNomes (cidades) {
    var nomes = cidades.map((el) => {
        return el.nome
    })
    return nomes
}

async function getFeriadosPorCidades(cidades) {
    for (const cidade of cidades) {
        await getFeriadosPorCidade(cidade)
    }  
}

async function execute(){
    const estados  = await getEstados();
    const cidades  = await getTodasAsCidades(estados);
    fs.writeFile('cidades.json', JSON.stringify(cidades, null, 2), err => {
        if(err) throw new Error('Alguma coisa deu errado')
        console.log('Deu certo!')
    })
}

execute()