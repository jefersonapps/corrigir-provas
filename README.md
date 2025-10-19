<div align="center">
  <img src="public/logo.png" alt="Logo Corretor de Provas" width="150"/>
  <h1>Corretor de Provas Automático</h1>
  <p>
    Uma aplicação web moderna e intuitiva para corrigir provas de múltipla escolha de forma rápida, eficiente e sem complicações.
  </p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.1-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC?logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</div>

---

## ✨ Funcionalidades Principais

Este sistema foi projetado para simplificar a vida de educadores, automatizando o processo de correção de provas e centralizando os dados de forma segura no navegador do usuário.

- **📝 Definição de Gabarito:** Crie e edite o gabarito da prova de forma visual e interativa.
- **🔄 Número de Questões Dinâmico:** Adicione ou remova questões facilmente, e todo o sistema se ajusta automaticamente.
- **👨‍🎓 Cadastro Completo de Alunos:** Adicione alunos, preencha suas respostas e receba feedback visual instantâneo de acertos e erros.
- **✏️ Edição e Exclusão:** Modifique os dados de um aluno (nome ou respostas) ou remova-o da lista com facilidade.
- **📊 Tabela de Resultados Clara:** Visualize os resultados de toda a turma em uma tabela organizada, com a média de acertos de cada aluno.
- **📄 Exportação para PDF:** Gere um relatório profissional em PDF com os resultados da prova, ideal para arquivamento e impressão.
- **💹 Exportação para CSV:** Exporte todos os dados, incluindo gabarito e respostas dos alunos, em formato CSV para uso em planilhas.
- **☁️ Importação de Dados:** Importe uma prova inteira (gabarito, informações e alunos) a partir de um único arquivo CSV, agilizando o cadastro.
- **💾 Persistência Local:** Todos os dados são salvos automaticamente no navegador (`localStorage`). Você pode fechar a aba e continuar seu trabalho depois sem perder nada.
- **🚀 Interface Intuitiva:** Um fluxo de 3 passos simples (Gabarito → Alunos → Resultados) guia o usuário durante todo o processo.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com um conjunto de tecnologias modernas para garantir uma experiência de usuário fluida e uma base de código robusta.

- **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Roteamento:** [React Router](https://reactrouter.com/)
- **Geração de PDF:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Manipulação de CSV:** [PapaParse](https://www.papaparse.com/)
- **Notificações (Toasts):** [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Como Executar o Projeto

Para rodar este projeto em seu ambiente local, siga os passos abaixo.

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [NPM](https://www.npmjs.com/) ou [PNPM](https://pnpm.io/)

### Instalação e Execução

1.  **Instale as dependências:**

    ```bash
    npm install
    # ou
    pnpm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm start
    # ou
    pnpm start
    ```

---

## 📄 Licença

Este projeto está sob a licença MIT.
