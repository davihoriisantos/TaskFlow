# TaskFlow — Gerenciador de Tarefas Web

## Objetivo
Aplicação web para cadastrar, consultar, editar, excluir, pesquisar e organizar tarefas pessoais em um quadro Kanban, acompanhando indicadores de produtividade.

## Funcionalidades
- Dashboard com total de tarefas, pendentes, em andamento e concluídas.
- Cadastro de título, descrição, prioridade (baixa, média ou alta) e prazo.
- Quadro Kanban com as colunas A Fazer, Em Andamento e Concluídas.
- Edição, exclusão e mudança de status das tarefas.
- Pesquisa pelo título e filtros simultâneos por prioridade e status.
- Limpeza dos filtros sem alterar os dados salvos.
- Persistência no `localStorage` do navegador.
- Aviso visual de tarefas atrasadas.

## Tecnologias
- HTML
- CSS
- JavaScript puro
- localStorage

Não utiliza frameworks, bibliotecas externas, APIs, backend ou banco de dados.

## Como executar
1. Baixe ou clone este repositório.
2. Abra a pasta `TaskFlow`.
3. Dê dois cliques no arquivo `index.html` ou abra-o no navegador.
4. Cadastre tarefas. Elas ficam salvas no `localStorage` do navegador utilizado.

## Arquivos
- `index.html`: estrutura e conteúdo da página.
- `style.css`: aparência e responsividade.
- `script.js`: cadastro, edição, exclusão, Kanban, pesquisa, filtros e armazenamento local.

## Integrantes
- Nome: __________________________________
- Nome: __________________________________

## Observação
Os dados são armazenados localmente no navegador. Se o usuário limpar os dados do navegador ou utilizar outro navegador/dispositivo, as tarefas não serão compartilhadas automaticamente.
