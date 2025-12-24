# AGENTS.md - Guia para Agentes de Código

Este documento fornece instruções essenciais para agentes de código (IA assistentes) que trabalharão neste projeto. Leia este documento **COMPLETAMENTE** antes de iniciar qualquer trabalho.

**📍 Navegação Rápida:**

- [🌐 Instruções Gerais](#-instruções-gerais) - Compreensão inicial do projeto
- [⚙️ Backend (NestJS + Prisma)](#%EF%B8%8F-backend-nestjs--prisma) - Arquitetura, padrões e desenvolvimento backend
- [🎨 Frontend (Next.js)](#-frontend-nextjs) - Arquitetura, padrões e desenvolvimento frontend
- [🧪 Testes](#-testes) - Implementação e manutenção de testes
- [📝 Documentação](#-documentação) - Atualização de documentação

---

## 🌐 Instruções Gerais

### 1. COMPREENSÃO INICIAL DO PROJETO

Antes de realizar QUALQUER alteração no código, você DEVE:

#### 1.1 Ler a Documentação Geral

Leia **todos** os seguintes arquivos:

1. **README.md** (raiz) - Visão geral do projeto
2. **CONTRIBUTING.md** - Diretrizes de contribuição e padrões de código
3. **DOCKER.md** - Configuração de infraestrutura

#### 1.2 Identificar a Área de Trabalho

- **Trabalhando no Backend?** → Leia a seção [⚙️ Backend](#%EF%B8%8F-backend-nestjs--prisma)
- **Trabalhando no Frontend?** → Leia a seção [🎨 Frontend](#-frontend-nextjs)
- **Trabalhando em ambos?** → Leia ambas as seções

#### 1.3 Stack Técnica Geral

**Infraestrutura:**

- **Containerização**: Docker + Docker Compose
- **Proxy Reverso**: Nginx
- **Desenvolvimento**: Hot reload habilitado em ambos os ambientes
- **Banco de Dados**: PostgreSQL
- **Gerenciador de Pacotes**: Yarn (⚠️ **NÃO use npm** - este projeto usa exclusivamente Yarn)

---

## ⚙️ Backend (NestJS + Prisma)

### 📚 Documentação Específica de Backend

Antes de trabalhar no backend, leia **todos** estes arquivos:

1. **backend/README.md** - Documentação completa do backend
2. **backend/TODO.md** - Tarefas pendentes e decisões técnicas
3. **backend/WEBSOCKET-SCALING.md** - Arquitetura de WebSockets
4. **backend/docs/** - Toda a documentação técnica adicional
5. **backend/prisma/schema.prisma** - Schema do banco de dados

#### Analisar o Schema do Banco de Dados

Leia **backend/prisma/schema.prisma** para entender:

- Modelo de dados completo
- Relacionamentos entre entidades
- Tipos de enum
- Índices e constraints

### 🏗️ Arquitetura Backend (Clean Architecture)

Este projeto utiliza **Clean Architecture** (Arquitetura Limpa):

```
backend/src/
├── domain/           # Regras de negócio, entidades, eventos
├── application/      # Casos de uso, DTOs, serviços
│   ├── dtos/        # Data Transfer Objects
│   ├── services/    # Lógica de aplicação
│   └── ports/       # Interfaces/contratos
└── infra/           # Adaptadores, configuração, persistência
    ├── adapters/    # Implementações de interfaces
    └── config/      # Configuração de módulos
```

**PRINCÍPIOS FUNDAMENTAIS:**

- **Dependências fluem para dentro**: Domain não depende de nada, Application depende de Domain, Infra depende de Application
- **Separação de responsabilidades**: Cada camada tem um propósito claro
- **Inversão de dependência**: Infra implementa interfaces definidas em Application (ports)

### 🛠️ Stack Técnica Backend

- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **WebSockets**: Socket.IO
- **Autenticação**: JWT
- **Validação**: class-validator + class-transformer
- **Testes**: Jest (unit + e2e)
- **Gerenciador de Pacotes**: Yarn (⚠️ **NÃO use npm** - use apenas `yarn` para instalar pacotes)

### 📂 Estrutura do Backend

**Localização de Componentes:**

- **Entidades**: `backend/src/domain/entities/`
- **DTOs**: `backend/src/application/dtos/{recurso}/`
- **Serviços**: `backend/src/application/services/`
- **Interfaces (Ports)**: `backend/src/application/ports/`
- **Repositórios**: `backend/src/infra/adapters/out/persistence/`
- **Controllers**: `backend/src/infra/adapters/in/web/`
- **Módulos**: `backend/src/infra/config/`
- **Testes E2E**: `backend/test/*.e2e-spec.ts`

### 🔧 Padrões de Código Backend

#### Localizar Arquivos Relevantes

1. Use ferramentas de busca para encontrar código relacionado
2. Leia os arquivos completos, não apenas trechos
3. Entenda o contexto e dependências

#### Identificar Padrões Existentes

- **Nomenclatura**: Observe como classes, métodos e variáveis são nomeados
- **Estrutura de pastas**: Siga a organização existente
- **DTOs**: Veja exemplos em `backend/src/application/dtos/`
- **Serviços**: Veja exemplos em `backend/src/application/services/`
- **Repositórios**: Veja exemplos em `backend/src/infra/adapters/out/persistence/`

#### Padrões Obrigatórios

**TypeScript:**

```typescript
// ✅ BOM - Tipagem explícita
async findById(id: string): Promise<User | null> {
  return this.prisma.user.findUnique({ where: { id } });
}

// ❌ RUIM - Tipagem implícita
async findById(id) {
  return this.prisma.user.findUnique({ where: { id } });
}
```

**DTOs com Validações:**

```typescript
// ✅ BOM - Validações completas
export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @Length(2, 2)
  country: string; // Código ISO de 2 caracteres

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

// ❌ RUIM - Sem validações
export class CreateAddressDto {
  street: string;
  country: string;
  latitude: number;
  longitude: number;
}
```

**Valores Monetários:**

```typescript
// ✅ BOM - Centavos (integer)
price: 2500; // R$ 25,00

// ❌ RUIM - Float
price: 25.0;
```

**Rotas Nested:**

```typescript
// ✅ BOM - Recursos aninhados quando há relacionamento
@Patch('/restaurants/:restaurantId/orders/:orderId/accept')

// ❌ RUIM - Rotas planas quando há relacionamento claro
@Patch('/orders/:orderId/accept')
```

### 🏗️ Criando um Novo Recurso Backend

Siga esta ordem ao criar um novo recurso:

1. **Domain**: Crie a entidade em `domain/entities/`
2. **Application - DTOs**: Crie DTOs em `application/dtos/{recurso}/`
3. **Application - Service**: Crie o serviço em `application/services/`
4. **Application - Port**: Defina a interface do repositório em `application/ports/out/`
5. **Infra - Adapter**: Implemente o repositório em `infra/adapters/out/persistence/`
6. **Infra - Controller**: Crie o controller em `infra/adapters/in/web/`
7. **Infra - Module**: Configure o módulo em `infra/config/`
8. **Testes**: Crie testes E2E em `test/{recurso}.e2e-spec.ts`

### 📋 Checklist Backend

- [ ] Li backend/README.md e toda documentação backend
- [ ] Entendi a Clean Architecture e as 3 camadas
- [ ] Analisei o schema Prisma
- [ ] Identifiquei padrões existentes
- [ ] Segui a estrutura de pastas correta
- [ ] Usei tipagem TypeScript forte
- [ ] Adicionei validações nos DTOs
- [ ] Respeitei as convenções (valores monetários, rotas nested)
- [ ] Criei/atualizei testes E2E
- [ ] Executei os testes e verifiquei que passam

---

## 🎨 Frontend (Next.js)

### 📚 Documentação Específica de Frontend

Antes de trabalhar no frontend, leia **todos** estes arquivos:

1. **frontend/README.md** - Documentação completa do frontend
2. **frontend/src/** - Estrutura de componentes e páginas

### 🏗️ Arquitetura Frontend

Este projeto utiliza **Next.js 15 com App Router**:

```
frontend/src/
├── app/                    # App Router (páginas e rotas)
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── profile/           # Páginas de perfil
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes UI (shadcn/ui)
├── contexts/             # React Context para estado global
├── lib/                  # Utilitários e helpers
│   ├── auth-utils.ts    # Utilitários de autenticação
│   └── service/         # Serviços de API
└── middleware.ts         # Middleware Next.js (auth, etc.)
```

**PRINCÍPIOS FUNDAMENTAIS:**

- **Server Components por padrão**: Use Client Components (`'use client'`) apenas quando necessário
- **Separação de responsabilidades**: Componentes, lógica e serviços separados
- **Composição**: Componentes pequenos e reutilizáveis
- **Tipagem forte**: TypeScript em todos os componentes e funções

### 🛠️ Stack Técnica Frontend

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **UI Library**: React 18+
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Estado**: React Context API
- **Autenticação**: Session-based com middleware
- **Requisições**: fetch API (Server Components) / axios (Client Components)

### 📂 Estrutura do Frontend

**Localização de Componentes:**

- **Páginas**: `frontend/src/app/`
- **Componentes Reutilizáveis**: `frontend/src/components/`
- **Componentes UI**: `frontend/src/components/ui/`
- **Layouts**: `frontend/src/components/layout/`
- **Contexts**: `frontend/src/contexts/`
- **Serviços API**: `frontend/src/lib/service/`
- **Utilitários**: `frontend/src/lib/`
- **Middleware**: `frontend/src/middleware.ts`

### 🔧 Padrões de Código Frontend

#### Identificar Padrões Existentes

- **Nomenclatura**: Observe como componentes, hooks e funções são nomeados
- **Estrutura**: Siga a organização de pastas do App Router
- **Componentes**: Veja exemplos em `frontend/src/components/`
- **Server vs Client**: Entenda quando usar cada tipo de componente
- **Contexts**: Veja exemplos em `frontend/src/contexts/`

#### Padrões Obrigatórios

**Server Components (Padrão):**

```typescript
// ✅ BOM - Server Component (sem 'use client')
export default async function RestaurantsPage() {
  const restaurants = await fetch("http://backend:3000/restaurants");
  const data = await restaurants.json();

  return (
    <div>
      {data.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}

// ❌ RUIM - Client Component desnecessário
("use client");
export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.json())
      .then(setRestaurants);
  }, []);

  return <div>{/* ... */}</div>;
}
```

**Client Components (Apenas quando necessário):**

```typescript
// ✅ BOM - Client Component para interatividade
"use client";

import { useState } from "react";

export function AddToCartButton({ itemId }: { itemId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    // lógica...
    setIsLoading(false);
  };

  return (
    <button onClick={handleAddToCart} disabled={isLoading}>
      {isLoading ? "Adicionando..." : "Adicionar ao Carrinho"}
    </button>
  );
}
```

**Tipagem de Props:**

```typescript
// ✅ BOM - Tipagem explícita
interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  };
  onSelect?: (id: string) => void;
}

export function RestaurantCard({ restaurant, onSelect }: RestaurantCardProps) {
  return <div>{/* ... */}</div>;
}

// ❌ RUIM - Sem tipagem
export function RestaurantCard({ restaurant, onSelect }) {
  return <div>{/* ... */}</div>;
}
```

**Estilização com Tailwind:**

```typescript
// ✅ BOM - Classes Tailwind organizadas
<div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
  <p className="text-sm text-gray-600">{description}</p>
</div>

// ❌ RUIM - Estilos inline ou CSS modules desnecessários
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <h2>{title}</h2>
</div>
```

### 🏗️ Criando um Novo Componente Frontend

Siga esta ordem ao criar um novo componente:

1. **Identificar tipo**: Determinar se é Server ou Client Component
2. **Localização**: Escolher pasta apropriada (`app/`, `components/`, `components/ui/`)
3. **Interface**: Definir tipos TypeScript para props
4. **Implementação**: Criar componente seguindo padrões
5. **Estilização**: Usar Tailwind CSS
6. **Integração**: Importar e usar em páginas/componentes pai

### 📋 Checklist Frontend

- [ ] Li frontend/README.md
- [ ] Entendi a estrutura do App Router
- [ ] Identifiquei padrões de componentes existentes
- [ ] Determinei se preciso de Server ou Client Component
- [ ] Usei tipagem TypeScript forte
- [ ] Apliquei Tailwind CSS para estilização
- [ ] Segui a estrutura de pastas correta
- [ ] Reutilizei componentes UI existentes quando possível
- [ ] Testei o componente no navegador

---

## 🧪 Testes

### 📍 Aplicável a: Backend e Frontend

### Backend: Testes E2E com Jest

#### Quando Implementar Novos Testes Backend

Você DEVE criar testes quando:

- Adicionar novos endpoints
- Criar novos casos de uso
- Modificar lógica de negócio existente
- Corrigir bugs (teste de regressão)

#### Quando Modificar Testes Existentes

Você DEVE modificar testes quando:

- Alterar contratos de API (rotas, DTOs, responses)
- Mudar comportamento de funcionalidades
- Atualizar validações
- Corrigir testes que falharam devido às suas alterações

#### Localização dos Testes Backend

- **Testes E2E**: `backend/test/*.e2e-spec.ts`
- **Configuração**: `backend/test/jest-e2e.json`

#### Padrão de Testes E2E Backend

```typescript
describe("Resource (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let resourceId: string;

  beforeAll(async () => {
    // Setup: criar app, limpar banco, autenticar
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Autenticar e obter token
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password" });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Cleanup: limpar dados de teste
    await cleanupTestData();
    await app.close();
  });

  describe("POST /resources", () => {
    it("should create a resource with valid data", async () => {
      const response = await request(app.getHttpServer())
        .post("/resources")
        .set("Authorization", `Bearer ${token}`)
        .send({
          // DTO completo com todos os campos obrigatórios
          name: "Test Resource",
          description: "Test Description",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Test Resource");
      resourceId = response.body.id;
    });

    it("should return 400 for invalid data", async () => {
      await request(app.getHttpServer())
        .post("/resources")
        .set("Authorization", `Bearer ${token}`)
        .send({
          /* dados inválidos */
        })
        .expect(400);
    });
  });
});
```

#### Convenções Importantes para Testes Backend

- **DTOs em testes**: Use os mesmos campos que a aplicação valida
- **Valores monetários**: Sempre use centavos (integers): `price: 2500` não `25.0`
- **Endereços**: Sempre inclua `postalCode`, `country` (2 chars), `latitude`, `longitude`, `type`
- **Rotas nested**: Use rotas completas: `/restaurants/:id/orders/:id/accept`
- **Cleanup**: Sempre limpe dados de teste no `afterAll`

#### Executando Testes Backend

```bash
cd backend

# Todos os testes
yarn test

# Apenas E2E
yarn test:e2e

# Com coverage
yarn test:cov

# Watch mode
yarn test:watch
```

### Frontend: Testes (Quando Implementados)

> **Nota**: O projeto atualmente não possui testes automatizados de frontend. Quando implementar, considere:
>
> - **Testing Library**: React Testing Library
> - **Framework**: Jest ou Vitest
> - **E2E**: Playwright ou Cypress
> - **Localização**: `frontend/__tests__/` ou `frontend/src/**/*.test.tsx`

### Interpretando Falhas de Testes

**Se testes falharem após suas alterações:**

1. **Leia a mensagem de erro completamente**
2. **Identifique se é problema no teste ou no código**
3. **Corrija o problema apropriado**
4. **NÃO skip testes sem documentar o motivo**

**Skipping Testes (Apenas em Casos Excepcionais):**

```typescript
it.skip("should do something (TODO: bug in production code)", async () => {
  // TODO: Fix bug in src/path/to/file.ts:123
  // Bug description: status variable is undefined
  // This test is correctly implemented but blocked by production bug
});
```

### Atualizando Documentação de Testes

Após modificar testes, verifique e atualize:

- **backend/docs/TESTING.md** - Métricas, status de testes backend
- Seções a atualizar:
  - Overview (número de testes)
  - Test suites (breakdown por arquivo)
  - Known Issues (se houver bugs)
  - Coverage (se mudou significativamente)

---

## 📝 Documentação

### 📍 Aplicável a: Backend e Frontend

### Quando Atualizar Documentação

Você DEVE atualizar documentação quando:

- Adicionar novos recursos ou funcionalidades
- Mudar comportamento de APIs ou componentes existentes
- Adicionar novas dependências
- Alterar configurações de infraestrutura
- Modificar processo de desenvolvimento
- Corrigir bugs significativos
- Atualizar testes

### Arquivos de Documentação a Verificar

#### SEMPRE verificar:

1. **README.md** (raiz)

   - Adicionar novos recursos à descrição
   - Atualizar seção de Features
   - Atualizar instruções se necessário

2. **backend/README.md** (se trabalhou no backend)

   - Documentar novos endpoints
   - Atualizar exemplos de uso
   - Atualizar seção de API

3. **frontend/README.md** (se trabalhou no frontend)

   - Documentar novos componentes
   - Atualizar estrutura de páginas
   - Atualizar guia de desenvolvimento

4. **CONTRIBUTING.md**

   - Se adicionar novos padrões de código
   - Se mudar processo de contribuição

5. **backend/docs/TESTING.md**

   - Após adicionar/modificar/remover testes
   - Atualizar métricas (números de testes)
   - Documentar Known Issues

6. **backend/TODO.md**
   - Marcar tarefas concluídas
   - Adicionar novas tarefas identificadas
   - Remover TODOs resolvidos

#### Verificar se relevante:

7. **DOCKER.md** - Se alterar configuração Docker
8. **backend/WEBSOCKET-SCALING.md** - Se alterar WebSocket
9. **Documentação técnica** em `backend/docs/` - Se adicionar recursos complexos

### Formato de Documentação

Use Markdown com:

- Títulos claros e hierárquicos
- Exemplos de código quando apropriado
- Listas e tabelas para clareza
- Emojis para destacar seções (opcional mas recomendado)
- Links entre documentos relacionados

### Exemplo de Atualização de README

```markdown
## ✨ Features

### Gerenciamento de Usuários

- ✅ Cadastro e autenticação
- ✅ Perfis de cliente, restaurante e entregador

### Pedidos (NOVO - adicionado em 24/12/2025)

- ✅ Criação de pedidos
- ✅ Acompanhamento em tempo real
- ✅ Sistema de notificações

### Interface do Usuário (ATUALIZADO - 24/12/2025)

- ✅ Dashboard de cliente redesenhado
- ✅ Novo componente de carrinho de compras
```

---

## ✅ Checklist Completo de Trabalho

### Para CADA tarefa solicitada, siga esta ordem:

#### 1. COMPREENSÃO

- [ ] Li toda documentação geral do projeto
- [ ] Li documentação específica (backend OU frontend)
- [ ] Entendi a arquitetura aplicável
- [ ] Localizei todos os arquivos que precisam ser modificados
- [ ] Identifiquei testes que podem ser afetados

#### 2. IMPLEMENTAÇÃO

- [ ] Segui os padrões de código estabelecidos (backend OU frontend)
- [ ] Respeitei a arquitetura (Clean Architecture OU App Router)
- [ ] Usei tipagem TypeScript adequada
- [ ] Adicionei validações apropriadas (DTOs backend OU props frontend)
- [ ] Testei localmente (yarn dev)

#### 3. TESTES

- [ ] Criei novos testes para novas funcionalidades (backend)
- [ ] Modifiquei testes afetados pelas alterações (backend)
- [ ] Executei os testes e verifiquei que passam
- [ ] Documentei testes que precisam ser skipped (se aplicável)
- [ ] Atualizei TESTING.md com novas métricas (se aplicável)

#### 4. DOCUMENTAÇÃO

- [ ] Verifiquei README.md (raiz)
- [ ] Verifiquei README.md específico (backend OU frontend)
- [ ] Atualizei CONTRIBUTING.md (se necessário)
- [ ] Atualizei documentação técnica relevante
- [ ] Atualizei TODO.md (marcar concluído/adicionar tarefas)

#### 5. REVISÃO FINAL

- [ ] Revisei todas as alterações
- [ ] Verifiquei consistência de código
- [ ] Confirmei que nada foi quebrado
- [ ] Documentei decisões técnicas importantes

---

## ⚠️ Avisos Importantes

### NÃO faça:

- ❌ Pular a leitura da documentação
- ❌ Ignorar a arquitetura estabelecida
- ❌ Modificar código sem entender o contexto
- ❌ Deixar testes falhando sem justificativa (backend)
- ❌ Esquecer de atualizar documentação
- ❌ Usar `any` no TypeScript
- ❌ Misturar responsabilidades entre camadas (backend)
- ❌ Criar DTOs sem validações (backend)
- ❌ Usar Client Components desnecessariamente (frontend)

### SEMPRE faça:

- ✅ Leia toda a documentação primeiro
- ✅ Siga os padrões estabelecidos
- ✅ Mantenha a arquitetura (Clean Architecture OU App Router)
- ✅ Escreva/atualize testes (backend)
- ✅ Atualize documentação
- ✅ Use tipagem forte em TypeScript
- ✅ Valide dados de entrada (DTOs backend, props frontend)
- ✅ Documente decisões complexas
- ✅ Teste no navegador antes de finalizar (frontend)

---

## 📚 Recursos Adicionais

### Backend

**Arquivos de Referência:**

- `backend/prisma/schema.prisma` - Modelo de dados
- `backend/src/application/dtos/` - Exemplos de DTOs
- `backend/test/*.e2e-spec.ts` - Exemplos de testes
- `backend/src/infra/config/` - Configuração de módulos

**Documentação Externa:**

- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [class-validator](https://github.com/typestack/class-validator)

### Frontend

**Arquivos de Referência:**

- `frontend/src/app/` - Estrutura de páginas
- `frontend/src/components/` - Componentes reutilizáveis
- `frontend/src/components/ui/` - Componentes UI base
- `frontend/src/contexts/` - Contexts de estado

**Documentação Externa:**

- [Next.js 15](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 🤝 Comunicação

Ao reportar conclusão de trabalho:

1. **Especifique a área**: "Trabalhei no Backend" OU "Trabalhei no Frontend" OU "Ambos"
2. **Liste TODAS as alterações feitas**
3. **Indique arquivos criados/modificados/deletados**
4. **Relate resultados de testes** (backend)
5. **Mencione atualizações de documentação**
6. **Destaque decisões técnicas importantes**

**Exemplo:**

```
Área: Backend

Alterações:
- Criado endpoint POST /restaurants/:id/menu-items
- Implementado CreateMenuItemDto com validações
- Adicionado serviço MenuItemService
- Criado repositório MenuItemRepository

Arquivos:
- Criado: backend/src/application/dtos/menu-item/create-menu-item.dto.ts
- Criado: backend/src/application/services/menu-item.service.ts
- Criado: backend/test/menu-items.e2e-spec.ts
- Modificado: backend/README.md

Testes:
- 8 novos testes E2E: 8/8 passing ✅

Documentação:
- Atualizado backend/README.md com novos endpoints
- Atualizado backend/docs/TESTING.md com novas métricas
```

---

## 📌 Versão do Documento

- **Versão**: 2.0.0
- **Data**: 24 de dezembro de 2025
- **Última Atualização**: 24/12/2025
- **Changelog**: Separação de instruções Backend e Frontend

Este documento deve ser atualizado sempre que houver mudanças significativas no projeto, arquitetura ou processos de desenvolvimento.

---

**Lembre-se**: A qualidade do código e a manutenibilidade do projeto dependem de você seguir estas diretrizes. Trabalhe com cuidado, atenção aos detalhes e sempre priorize a compreensão antes da ação.
