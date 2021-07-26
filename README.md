# ApiMysql
Exemplo de uma Api realizando operações básicas de CRUD com mysql e docker-compose

Para Instalar basta baixar todos os pacotes do arquivos packages.config com yarn add <nome do pacote>
  
O Único pacote que é instalado com npm é o do Knext (o que faz o acesso com o banco de dados mysql)
Instalação do Knext: npm install knex --save
  <a href="https://knexjs.org/">  Documentação do Knext </a>
  
Para rodar a aplicação depois de todos os pacotes instalados:
yarn start 
  
Para subir o container para o docker é necessário ter o docker instalado em sua máquina:
<a href="https://www.notion.so/Instalando-Docker-6290d9994b0b4555a153576a1d97bee2">  Tutorial de instalação do Docker </a>
  
Caso queira executar de dentro do container:
docker-compose up
  
Após isso a aplicação estará rodando em:
http://localhost:8080/
  
Endpoint base para todos os métodos (GET, POST, PUT e DELETE)
/contatos
