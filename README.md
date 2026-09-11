# 🌸 JR Lingeries

> **E-commerce de lingerie em desenvolvimento**, criado para transformar uma necessidade real de gestão e vendas em uma aplicação web moderna, responsiva e intuitiva.

<div align="center">

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-ffb6c1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL%20%2F%20MariaDB-database-4479A1?style=for-the-badge&logo=mysql)

</div>

## ✨ Sobre o projeto

O **JR Lingeries** é um projeto de e-commerce desenvolvido para uma loja de moda íntima, com uma identidade visual delicada e uma arquitetura pensada para integrar **vendas, catálogo, estoque e gerenciamento administrativo** em uma única aplicação.

O projeto nasceu a partir de uma necessidade real: criar uma solução para facilitar a apresentação dos produtos e, ao mesmo tempo, organizar processos relacionados à administração da loja.

O desenvolvimento acontece de forma incremental, utilizando tecnologias modernas do ecossistema JavaScript/TypeScript e evoluindo conforme novas necessidades são identificadas.

### 🎯 Objetivos

- Criar uma experiência de compra simples, agradável e responsiva;
- Apresentar os produtos de forma clara e atrativa;
- Permitir gerenciamento de produtos e estoque;
- Trabalhar com diferentes variações de cor e disponibilidade;
- Implementar ofertas e descontos;
- Separar os acessos de clientes e administração;
- Construir uma base preparada para futuras funcionalidades de vendas e pedidos.

## 🛍️ Funcionalidades

### 👩‍🛍️ Área do cliente

- [x] Página inicial
- [x] Catálogo de produtos
- [x] Produtos organizados por categorias
- [x] Página individual do produto
- [x] Seleção de cores disponíveis
- [x] Indicação de cores sem estoque
- [x] Carrinho de compras
- [x] Exibição de preços promocionais
- [x] Aplicação de ofertas e descontos
- [x] Cadastro de usuário
- [x] Login
- [x] Autenticação integrada ao banco de dados
- [ ] Área completa do cliente
- [ ] Histórico de pedidos
- [ ] Finalização de pedidos

### 👩‍💼 Área administrativa — Patroa

- [x] Dashboard administrativo
- [x] Resumo de vendas
- [x] Indicadores financeiros
- [x] Gerenciamento de produtos
- [x] Controle de estoque
- [x] Estoque por variação de cor
- [x] Gerenciamento de categorias
- [x] Gerenciamento de ofertas e descontos
- [x] Upload de imagens dos produtos
- [x] Autenticação e controle de acesso
- [x] Estrutura para gerenciamento de clientes
- [ ] Controle completo de pedidos e vendas
- [ ] Controle de clientes inadimplentes
- [ ] Envio de cobranças/notificações por e-mail

> 🚧 **Projeto em desenvolvimento:** novas funcionalidades estão sendo implementadas de forma incremental conforme o projeto evolui.

## 🎨 Identidade visual

A interface utiliza uma paleta delicada alinhada à proposta da marca:

| Cor | Hexadecimal | Aplicação |
| --- | --- | --- |
| 🌸 Rosa principal | `#FFB6C1` | Destaques e ações |
| 🎀 Rosa claro | `#FFF0F5` | Fundos e áreas de destaque |
| 🤍 Branco | `#FFFFFF` | Cards e conteúdo |
| 🟤 Texto | `#4A3E3D` | Textos e contrastes |

## 🧰 Tecnologias

- **Next.js 16** — framework principal da aplicação
- **React 19** — construção das interfaces e componentes
- **TypeScript 5** — tipagem estática e segurança no desenvolvimento
- **Prisma** — ORM e integração com o banco de dados
- **MySQL / MariaDB** — banco de dados relacional
- **Cloudinary** — armazenamento e gerenciamento das imagens dos produtos
- **CSS / CSS Modules** — estilização e responsividade
- **ESLint** — qualidade e padronização do código
- **Git / GitHub** — versionamento e colaboração

## 🔐 Autenticação e permissões

O projeto possui autenticação integrada ao banco de dados e diferencia os acessos conforme o perfil do usuário:

- **CLIENTE** — acesso às funcionalidades destinadas à experiência de compra;
- **PATROA** — acesso ao dashboard e às funcionalidades administrativas.

As sessões são protegidas e as rotas administrativas possuem controle de acesso.

> 🔒 **Segurança:** credenciais, chaves de API e variáveis de ambiente não devem ser versionadas no repositório. Arquivos `.env` devem permanecer fora do controle de versão.

## 🗄️ Banco de dados

O projeto utiliza **MySQL / MariaDB** como banco de dados relacional, integrado à aplicação por meio do **Prisma ORM**.

A estrutura contempla entidades relacionadas a:

- Usuários e autenticação;
- Clientes;
- Produtos;
- Categorias;
- Variações de produtos por cor;
- Estoque e movimentações;
- Ofertas e descontos;
- Vendas e itens de venda;
- Transações financeiras.

O banco é desenvolvido inicialmente em ambiente local e a infraestrutura de produção será definida conforme a evolução do projeto.

## ☁️ Imagens dos produtos

As imagens dos produtos são armazenadas utilizando **Cloudinary**, evitando manter arquivos de imagem diretamente no repositório.

O upload é realizado por uma rota protegida da área administrativa, com validação do tipo e tamanho do arquivo e geração da URL para utilização no catálogo.

## 🎨 Variações de cor e estoque

Os produtos podem possuir múltiplas variações de cor, cada uma com seu próprio controle de estoque.

Exemplo:

```text
Produto: Conjunto Elegance

🌸 Rosa       → 5 unidades
🖤 Preto      → 3 unidades
🤍 Branco     → 0 unidades
```

Quando uma determinada cor fica sem estoque, ela é apresentada ao cliente como **indisponível**, enquanto as demais continuam disponíveis para seleção.

> Atualmente, as variações de cor compartilham a mesma imagem principal do produto. Imagens específicas por cor não fazem parte da implementação atual.

## 🏷️ Ofertas e descontos

O sistema permite cadastrar ofertas para os produtos e apresentar ao cliente informações como:

- Preço original;
- Preço promocional;
- Valor economizado;
- Percentual de desconto;
- Nome da oferta.

Essas informações também são consideradas na experiência do carrinho de compras.

## 📁 Estrutura do projeto

```text
jr-lingeries/
├── prisma/
│   └── schema.prisma          # Modelagem do banco de dados
│
├── src/
│   ├── app/
│   │   ├── cadastro/          # Cadastro de clientes
│   │   ├── carrinho/          # Carrinho de compras
│   │   ├── cliente/           # Área do cliente
│   │   ├── login/             # Login e autenticação
│   │   ├── patroa/            # Área administrativa
│   │   │   ├── categorias/    # Gerenciamento de categorias
│   │   │   ├── estoque/       # Gerenciamento de produtos e estoque
│   │   │   └── ofertas/       # Gerenciamento de ofertas
│   │   ├── produtos/          # Catálogo e detalhes dos produtos
│   │   ├── api/               # Rotas da aplicação
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página inicial
│   │
│   ├── assets/                # Imagens e recursos estáticos
│   ├── components/            # Componentes reutilizáveis
│   ├── data/                  # Tipagens e dados da aplicação
│   └── lib/                   # Prisma, autenticação e regras compartilhadas
│
├── generated/                 # Cliente Prisma gerado
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/DevDonov4n/jr-lingeries.git
cd jr-lingeries
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as credenciais do banco de dados e as configurações necessárias para autenticação e Cloudinary.

> ⚠️ **Nunca publique suas credenciais reais no GitHub.**

### 4. Gere o cliente Prisma

```bash
npx prisma generate
```

### 5. Execute o projeto em desenvolvimento

```bash
npm run dev
```

Depois, acesse **http://localhost:3000** no navegador.

### Outros comandos

```bash
npm run build   # Gera o build de produção
npm start       # Executa a versão de produção
npm run lint    # Verifica o código com ESLint
```

## 🗺️ Roadmap

- [x] Estrutura inicial do e-commerce
- [x] Home page
- [x] Catálogo de produtos
- [x] Organização por categorias
- [x] Página de detalhes do produto
- [x] Carrinho de compras
- [x] Cadastro de clientes
- [x] Sistema de login e autenticação
- [x] Área administrativa
- [x] Banco de dados MySQL / MariaDB
- [x] Integração com Prisma
- [x] Gerenciamento de produtos
- [x] Controle de estoque
- [x] Variações de produtos por cor
- [x] Gerenciamento de categorias
- [x] Sistema de ofertas e descontos
- [x] Upload de imagens com Cloudinary
- [ ] Área completa do cliente
- [ ] Sistema de pedidos
- [ ] Controle completo de vendas
- [ ] Controle de inadimplência
- [ ] Notificações e cobranças por e-mail
- [ ] Deploy da aplicação

## 📱 Responsividade

A aplicação está sendo desenvolvida para proporcionar uma experiência consistente em diferentes dispositivos:

- 📱 Smartphones
- 📲 Tablets
- 💻 Notebooks
- 🖥️ Desktops

## 👨‍💻 Desenvolvedor

Projeto desenvolvido por **Donovan Bueno**, com foco em desenvolvimento web e construção de uma aplicação real de e-commerce utilizando tecnologias modernas de desenvolvimento.

[![GitHub](https://img.shields.io/badge/GitHub-DevDonov4n-181717?style=for-the-badge&logo=github)](https://github.com/DevDonov4n)

---

<div align="center">

**JR Lingeries — Projeto em desenvolvimento 🌸**

Construído com Next.js, React, TypeScript, Prisma e MySQL/MariaDB.

</div>
