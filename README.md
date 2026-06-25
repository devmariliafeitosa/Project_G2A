# Sistema de Alocação Acadêmica

Sistema desenvolvido pela equipe **NanoTech** para gerenciamento e alocação de horários acadêmicos.

A aplicação permite o gerenciamento completo da estrutura acadêmica, contando com diferentes níveis de acesso para **Administradores**, **Coordenadores** e **Professores**, além de recursos para administração de cursos, disciplinas, docentes, horários e demais informações necessárias para o planejamento acadêmico.

---

## Tecnologias Utilizadas

### Front-end

* React
* Node.js
* Vite

### Back-end

* Python
* Django
* Django REST Framework

### Banco de Dados

* PostgreSQL

---

# Como executar o projeto

## Pré-requisitos

Antes de iniciar, tenha instalado:

* Node.js (versão 18 ou superior)
* npm
* Python 3.12 ou superior
* PostgreSQL

---

## 1. Clonar o repositório

```bash
git clone https://github.com/devmariliafeitosa/Project_G2A.git
cd Project_G2A
```

---

## 2. Configurar o Back-end

Entre na pasta do backend:

```bash
cd backend
```

Crie um ambiente virtual.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Configure o arquivo `.env` conforme o ambiente.

Inicie o servidor:

```bash
python manage.py runserver
```

O backend estará disponível em:

```
http://localhost:8000
```

---

## 3. Configurar o Front-end

Abra outro terminal.

Entre na pasta do frontend:

```bash
cd Project_G2A
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env` caso necessário.

Inicie a aplicação:

```bash
npm run dev
```

O frontend estará disponível em:

```
http://localhost:3000
```

---

# Estrutura do Projeto

```
/
├── backend/
│   ├── requirements.txt
│   └── ...
│
├── src/
│   ├── main.tsx
│   └── ...
│
└── README.md
```

---

# Equipe

Projeto desenvolvido pela equipe **NanoTech**.
