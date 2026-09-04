# 🌸 JR Lingeries

> **E-commerce de lingerie em desenvolvimento**, criado com foco em uma experiência de compra moderna, responsiva e intuitiva.

<div align="center">

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-ffb6c1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

</div>

## ✨ Sobre o projeto

O **JR Lingeries** é um projeto de e-commerce desenvolvido para uma loja de moda íntima, com uma identidade visual delicada e uma arquitetura preparada para evoluir para uma aplicação completa de vendas e gerenciamento.

O desenvolvimento acontece de forma incremental, começando pela interface e pelos principais fluxos da loja e avançando para autenticação, banco de dados e funcionalidades administrativas.

### 🎯 Objetivos

- Criar uma experiência de compra simples e agradável;
- Apresentar os produtos de forma clara e atrativa;
- Desenvolver um carrinho de compras funcional;
- Estruturar áreas específicas para clientes e administração;
- Preparar a aplicação para integração com banco de dados e autenticação;
- Construir uma base escalável para futuras funcionalidades.

## 🛍️ Funcionalidades

### Cliente

- [x] Página inicial
- [x] Catálogo de produtos
- [x] Página individual do produto
- [x] Carrinho de compras
- [x] Cadastro de usuário
- [x] Interface de login
- [ ] Autenticação integrada ao banco de dados
- [ ] Área completa do cliente
- [ ] Histórico de pedidos

### Administração — Área da Patroa

- [x] Estrutura inicial do dashboard
- [x] Visualização de informações de vendas
- [x] Estrutura para controle de clientes
- [ ] Persistência dos dados no banco
- [ ] Gerenciamento de produtos
- [ ] Controle de vendas
- [ ] Controle de clientes inadimplentes
- [ ] Envio de notificações por e-mail

> 🚧 **Projeto em desenvolvimento:** os itens pendentes fazem parte do roadmap e serão implementados nas próximas etapas.

## 🎨 Identidade visual

A interface utiliza uma paleta delicada alinhada à proposta da marca:

| Cor | Hexadecimal | Aplicação |
| --- | --- | --- |
| 🌸 Rosa principal | `#FFB6C1` | Destaques e ações |
| 🎀 Rosa claro | `#FFF0F5` | Fundos e áreas de destaque |
| 🤍 Branco | `#FFFFFF` | Cards e conteúdo |
| 🟤 Texto | `#4A3E3D` | Textos e contrastes |

## 🧰 Tecnologias

- **Next.js 16** — framework principal
- **React 19** — construção da interface
- **TypeScript 5** — tipagem estática
- **CSS / CSS Modules** — estilização
- **ESLint** — qualidade e padronização do código

## 📁 Estrutura

```text
jr-lingeries/
├── src/
│   ├── app/
│   │   ├── cadastro/       # Cadastro de clientes
│   │   ├── carrinho/       # Carrinho de compras
│   │   ├── cliente/        # Área do cliente
│   │   ├── login/          # Login
│   │   ├── patroa/         # Dashboard administrativo
│   │   ├── produtos/       # Catálogo e detalhes dos produtos
│   │   ├── globals.css     # Estilos globais
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página inicial
│   │
│   ├── assets/             # Imagens dos produtos
│   └── components/         # Componentes reutilizáveis
│
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

### 3. Execute o projeto

```bash
npm run dev
```

Depois, acesse **http://localhost:3000** no navegador.

### Outros comandos

```bash
npm run build   # Build de produção
npm start       # Executa a versão de produção
npm run lint    # Verifica o código com ESLint
```

## 🗺️ Roadmap

- [x] Estrutura inicial do e-commerce
- [x] Home page
- [x] Catálogo de produtos
- [x] Página de detalhes do produto
- [x] Carrinho
- [x] Cadastro
- [x] Interface de login
- [x] Área administrativa inicial
- [ ] Integração com PostgreSQL
- [ ] Sistema de autenticação completo
- [ ] Integração cliente × banco de dados
- [ ] Integração dashboard × banco de dados
- [ ] Gerenciamento de produtos
- [ ] Controle de pedidos e vendas
- [ ] Controle de inadimplência
- [ ] Deploy da aplicação

## 🔐 Banco de dados e autenticação

A próxima etapa é implementar a camada de persistência e autenticação.

A proposta atual é utilizar **PostgreSQL** durante o desenvolvimento e preparar o projeto para hospedagem do banco em ambiente de produção.

> 🔒 Credenciais, chaves de API e variáveis de ambiente não devem ser versionadas no repositório.

## 📱 Responsividade

A aplicação está sendo desenvolvida para proporcionar uma experiência consistente em:

- 📱 Smartphones
- 📲 Tablets
- 💻 Notebooks
- 🖥️ Desktops

## 👨‍💻 Desenvolvedor

Projeto desenvolvido por **Donovan Bueno**, com foco em desenvolvimento web e construção de uma aplicação real de e-commerce.

[![GitHub](https://img.shields.io/badge/GitHub-DevDonov4n-181717?style=for-the-badge&logo=github)](https://github.com/DevDonov4n)

---

<div align="center">

**JR Lingeries — Projeto em desenvolvimento 🌸**

Construído com Next.js, React e TypeScript.

</div>
