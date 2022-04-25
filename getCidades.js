const axios = require("axios");

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

    //console.log(UF)
    await apiEstados.get(`/${UF}/municipios`)
    .then((response) => {
        return formatarNomes(response.data)
    })
    .catch((error) => {
        return error.response.data
    });

}

function formatarNomes (cidades) {
    var nomes = cidades.map((el) => {
        return el.nome
    })
    //console.log('nomes', nomes)
    return nomes
}

(async () => {
    const estados = await getEstados();
    // estados.forEach(el => {
        //let cidades = await getCidades(el.sigla)
        let cidades = await getCidades('AM')
        for (const cidade of cidades) {
            getFeriados(cidade)
        }
    // });
})()


