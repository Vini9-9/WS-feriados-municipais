# Web scraping para coletar feriados municipais

* Tecnologia utilizada: NodeJS com o módulo puppeteer;
* Sites de referência: 
- https://calendario.online/ para WS;
- https://www.feriados.com.br/ para validação;


## Tasks 

- [X] Listar o nome de todos os estados do Brasil;
- [X] Listar o nome de todas as cidades do Brasil;
- [X] Listar todos os feriados municipais por cidade;
- [X] Listar todos os feriados municipais por estado;
- [X] Atualizar arquivo dos feriados por estado com as cidades restantes (não processadas);
- [X] Listar todos os feriados municipais do Brasil;

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
* Para listar os feriados municipais de todas as cidades de um Estado
```
npm run list-state 
```
Deve-se informar os dados solicitados:
```
Qual a sigla do estado onde fica a cidade? R.:DF
LOG: Sigla informada: DF
```
Após informado os sites de cada cidade serão acessados via WS
e você será informado quando o arquivo com os feriados for criado.
```
Consegui criar o arquivo feriados-municipais-DF.json //localizado na pasta 'estados'
```

* Para atualizar o ano dos feriados municipais de todas as cidades de um Estado
```
npm run update 
```
Deve-se informar os dados solicitados:
```
Qual a sigla do estado? R.: DF
LOG: Sigla informada: DF
```
Você será informado quando o arquivo com os feriados atualizados for criado na pasta correspondente ao ano
```
Atualizado feriados de "2022" para "2023"
```
