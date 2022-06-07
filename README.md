* Sites de referência: https://www.feriados.com.br/ e https://calendario.online/

## Tasks 

- [X] Pegar o nome de todos os estados do Brasil;
- [X] Pegar o nome de todas as cidades do Brasil;
- [X] Pegar todos os feriados de uma cidade do Brasil;
- [ ] Pegar todos os feriados municipais do Brasil;

# Pré requisitos

- Git (https://git-scm.com/)
- Node (https://nodejs.org)

# Instalação

## Clonando o Repositório ##
Com o Git e o Node.js instalado na sua maquina e a **URL** do projeto em mãos, cria em algum lugar do seu pc uma pasta para criarmos uma copia do repositório, dentro dela abra o **cmd** ou **powershell** e digite os comandos abaixo:
```
git clone https://github.com/Vini9-9/WS-feriados-municipais
cd WS-feriados-municipais
npm install
```
## Executando o Programa ##
```
// Para listar todas as cidades
node getCidades.js // será gerado um arquivo 'cidades.json'
// Para listar os feriados municipais de uma cidade
node getFeriados.js // será gerado um arquivo 'feriado-municipal.json'
```