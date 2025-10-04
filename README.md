# Plaxo Pay - Centralized Payment Manager

Sistema de gerenciamento centralizado de pagamentos para múltiplas aplicações, construído com NestJS seguindo Domain-Driven Design (DDD) e Clean Architecture.

## 🏗️ Arquitetura

### Estrutura de Camadas

```
src/
├── domain/                 # Camada de Domínio
│   ├── entities/          # Entidades de negócio
│   ├── value-objects/     # Objetos de valor
│   ├── repositories/      # Interfaces de repositórios
│   ├── gateways/         # Interfaces de gateways
│   └── events/           # Eventos de domínio
├── application/           # Camada de Aplicação
│   ├── use-cases/        # Casos de uso
│   ├── services/         # Serviços de aplicação
│   └── dtos/            # DTOs de aplicação
├── infrastructure/        # Camada de Infraestrutura
│   ├── database/         # Configuração e entidades do banco
│   └── gateways/        # Implementações de gateways
└── interfaces/           # Camada de Interface
    ├── controllers/      # Controllers REST
    └── dtos/            # DTOs de interface
```

## 🚀 Funcionalidades

### Pagamentos
- ✅ Pagamento via PIX direto
- ✅ Pagamento com cartão de crédito/débito
- ✅ Consulta de status de pagamentos
- ✅ Histórico de pagamentos por aplicação
- ✅ Cancelamento de pagamentos

### Assinaturas
- ✅ Criação de assinaturas recorrentes
- ✅ Ciclos de cobrança (mensal, trimestral, anual)
- ✅ Gerenciamento de status (ativa, cancelada, suspensa)
- ✅ Consulta de assinaturas por aplicação/cliente
- ✅ Identificação de assinaturas vencidas

### Integrações
- ✅ Gateway Mercado Pago (implementado)
- ✅ Arquitetura desacoplada para novos gateways
- ✅ Event Bus para ações pós-pagamento

## 🛠️ Tecnologias

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest
- **Gateway**: Mercado Pago

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd plaxo-pay
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrations:
```bash
npm run migration:run
```

5. Execute as seeds (opcional):
```bash
npm run seed
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`
Documentação Swagger em `http://localhost:3000/api`

## 🧪 Testes

### Testes Unitários
```bash
npm run test
```

### Testes E2E
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:cov
```

## 📚 API Endpoints

### Pagamentos

#### Criar Pagamento
```http
POST /payments
Content-Type: application/json

{
  "applicationId": "uuid",
  "amount": 100.00,
  "currency": "BRL",
  "method": "pix",
  "description": "Compra de produto",
  "customerId": "customer_123"
}
```

#### Consultar Pagamento
```http
GET /payments/{id}
```

#### Listar Pagamentos por Aplicação
```http
GET /payments/application/{applicationId}?status=approved
```

### Assinaturas

#### Criar Assinatura
```http
POST /subscriptions
Content-Type: application/json

{
  "applicationId": "uuid",
  "planName": "Plano Premium",
  "amount": 29.90,
  "billingCycle": "monthly",
  "customerId": "customer_123"
}
```

#### Consultar Assinatura
```http
GET /subscriptions/{id}
```

#### Listar Assinaturas por Aplicação
```http
GET /subscriptions/application/{applicationId}?status=active
```

#### Cancelar Assinatura
```http
PUT /subscriptions/{id}/cancel
```

## 🔄 Eventos de Domínio

O sistema emite eventos para permitir ações futuras:

- `payment.created` - Pagamento criado
- `payment.approved` - Pagamento aprovado
- `payment.rejected` - Pagamento rejeitado
- `subscription.created` - Assinatura criada
- `subscription.cancelled` - Assinatura cancelada
- `subscription.renewal.due` - Assinatura com vencimento próximo

## 🏗️ Extensibilidade

### Adicionando Novo Gateway de Pagamento

1. Implemente a interface `PaymentGateway`:
```typescript
@Injectable()
export class NovoGateway implements PaymentGateway {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implementação específica
  }
  // ... outros métodos
}
```

2. Registre no módulo:
```typescript
{
  provide: PaymentGateway,
  useClass: NovoGateway,
}
```

### Adicionando Novos Métodos de Pagamento

1. Adicione ao enum `PaymentMethod`
2. Implemente a lógica no gateway
3. Atualize os DTOs se necessário

## 📊 Banco de Dados

### Entidades Principais

- **applications**: Aplicações consumidoras
- **payments**: Pagamentos realizados
- **subscriptions**: Assinaturas ativas

### Relacionamentos

- Application 1:N Payment
- Application 1:N Subscription
- Subscription 1:N Payment (pagamentos recorrentes)

## 🔒 Segurança

- Validação de entrada com class-validator
- API Keys para autenticação de aplicações
- Sanitização de dados sensíveis
- Logs de auditoria

## 📈 Monitoramento

- Logs estruturados
- Métricas de performance
- Health checks
- Alertas de falhas de pagamento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.