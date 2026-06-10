# FC Monolito

Uma arquitetura de monólito modular construída com TypeScript e Express.

## 📋 Funcionalidades

- **Gestão de Clientes**: Cadastro e consulta de clientes
- **Gestão de Produtos**: Cadastro e controle de estoque
- **Checkout**: Processamento completo de compras
- **Gestão de Faturas**: Geração e consulta de notas fiscais
- **Processamento de Pagamentos**: Integração de pagamentos

## 🚀 Instalação e Execução

### Instalando dependências

```bash
npm install
```

### Rodando os testes (testes unitários + E2E)

```bash
npm test
```

Para executar apenas os testes de um módulo específico:

```bash
npx jest src/modules/invoice
```

Para executar apenas os testes E2E da API:

```bash
npx jest src/api
```

### Iniciando o servidor

```bash
npm start
```

O servidor será iniciado na porta `3000` (ou conforme definido pela variável de ambiente `PORT`).

## 📡 Endpoints da API

### Produtos

#### Cadastrar Produto
```
POST /products
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "purchasePrice": number,
  "stock": number
}

Response (201):
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "purchasePrice": number,
  "stock": number
}
```

### Clientes

#### Cadastrar Cliente
```
POST /clients
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "document": "string",
  "address": {
    "street": "string",
    "number": "string",
    "complement": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  }
}

Response (201):
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "document": "string",
  "address": { ... }
}
```

### Checkout

#### Realizar Compra
```
POST /checkout
Content-Type: application/json

{
  "clientId": "uuid",
  "products": [
    {
      "productId": "uuid",
      "name": "string",
      "description": "string",
      "salesPrice": number,
      "quantity": number
    }
  ]
}

Response (201):
{
  "invoiceId": "uuid",
  "status": "string",
  "total": number
}
```

### Notas Fiscais

#### Consultar Nota Fiscal
```
GET /invoice/{id}

Response (200):
{
  "id": "uuid",
  "name": "string",
  "document": "string",
  "street": "string",
  "number": "string",
  "complement": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "items": [ ... ],
  "total": number,
  "createdAt": "date"
}
```

## 🧪 Testes

A suite de testes inclui:

- **Testes Unitários**: Para cada módulo (client-adm, product-adm, invoice, payment, store-catalog)
- **Testes E2E**: Para validar o fluxo completo da API

Os testes E2E validam:
- ✅ Status code correto (200/201/404)
- ✅ Resposta com dados corretos
- ✅ Validações de negócio
- ✅ Tratamento de erros

## 📁 Estrutura do Projeto

```
src/
├── api/
│   ├── express.ts              # Servidor Express e rotas
│   └── express.spec.ts         # Testes E2E da API
├── modules/
│   ├── @shared/                # Código compartilhado
│   ├── client-adm/             # Módulo de gestão de clientes
│   ├── product-adm/            # Módulo de gestão de produtos
│   ├── invoice/                # Módulo de gestão de faturas
│   ├── payment/                # Módulo de processamento de pagamentos
│   └── store-catalog/          # Módulo de catálogo de produtos
└── main.ts                     # Arquivo de inicialização do servidor
```

## 🏗️ Arquitetura

O projeto segue os princípios de Clean Architecture com:

- **Domain**: Entidades de negócio e regras de negócio
- **Use Cases**: Lógica de aplicação
- **Gateways**: Abstrações para acesso a dados
- **Repositories**: Implementação de persistência
- **Facades**: Interface simplificada para módulos
- **Factories**: Criação de instâncias

## 📦 Dependências Principais

- **express**: Framework web
- **sequelize**: ORM para banco de dados
- **sqlite3**: Banco de dados
- **jest**: Framework de testes
- **supertest**: Testes HTTP
- **typescript**: Linguagem
