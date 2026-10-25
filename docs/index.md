---
layout: home

hero:
  name: "ArqenCore"
  text: "Framework Base para Plugins Minecraft"
  tagline: "Alta performance, corrotinas assíncronas, banco resiliente e injeção de contexto desacoplada para Spigot e Paper."
  actions:
    - theme: brand
      text: Começar Agora →
      link: /getting-started/installation
    - theme: alt
      text: Ver no GitHub
      link: https://github.com/s0sats/arqencore-docs

features:
  - icon: ⚡
    title: Concorrência com MCCoroutine
    details: Execute operações de I/O de rede e banco de dados sem travar a Main Thread (20 TPS garantidos). Retorne com segurança ao dispatcher do Minecraft.
    link: /modules/concurrency
  - icon: 🗄️
    title: Banco de Dados com Exposed & HikariCP
    details: Suporte nativo a H2, MySQL, MariaDB e PostgreSQL com failover de emergência automático e transações suspensas assíncronas.
    link: /modules/database
  - icon: 🎮
    title: Comandos Declarativos com ACF
    details: Estruture comandos e subcomandos com anotações modernas (@CommandAlias, @Subcommand), permissões e autocompletions dinâmicos.
    link: /modules/commands
  - icon: 🖼️
    title: Menus e GUIs com ObliviateInvs
    details: Interfaces declarativas baseadas em matrizes de caracteres, itens multi-versão via XSeries e suporte avançado a slots e paginação.
    link: /modules/gui
  - icon: 🎨
    title: Textos Modernos com Adventure
    details: Renderização de componentes via MiniMessage nativo com suporte a gradientes RGB, eventos de clique/hover e eliminação de códigos legados §.
    link: /modules/messages
  - icon: 🌍
    title: Manipulação de Mundos com FAWE
    details: Operações de alto volume, salvamento e colagem assíncrona de schematics modernos no formato Sponge (.schem) e regiões cubóides.
    link: /modules/world
---

<div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
  <img src="https://img.shields.io/badge/Minecraft-1.16.5--1.20+-blue?style=for-the-badge&logo=minecraft&logoColor=white" alt="Minecraft Version" />
  <img src="https://img.shields.io/badge/Kotlin-1.9.22-purple?style=for-the-badge&logo=kotlin&logoColor=white" alt="Kotlin Version" />
  <img src="https://img.shields.io/badge/Java-17%20%7C%2021-orange?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java Version" />
  <img src="https://img.shields.io/badge/Paper%20%26%20Spigot-Compatível-brightgreen?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Versão-1.2.5-emerald?style=for-the-badge" alt="ArqenCore Version" />
</div>

---

## 🎯 Por que utilizar o ArqenCore?

O **ArqenCore** foi projetado para resolver os maiores desafios enfrentados por servidores de médio e grande porte:

::: tip Zero Lag na Main Thread
Operações de banco de dados e requisições HTTP nunca bloqueiam os 50 milissegundos do tick do Minecraft.
:::

::: warning Desacoplamento e Segurança
Seus plugins herdam de `Plugin : JavaPlugin`, recebendo um contexto isolado (`PluginContext`), sistema automático de licenciamento e proteção contra vazamento de memória após recargas (`/reload`).
:::

::: danger Resiliência de Infraestrutura
Falhas de conexão com bancos de dados remotos ativam instantaneamente um banco de emergência SQLite/H2 local, mantendo o servidor operando sem interrupções.
:::
