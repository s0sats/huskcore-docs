import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ArqenCore Documentation',
  titleTemplate: ':title | ArqenCore',
  description: 'Framework Base e Biblioteca Central da Rede ArqenMC',
  lang: 'pt-BR',
  base: process.env.BASE_URL || '/huskcore-docs/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#10b981' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'ArqenCore Documentation' }],
    ['meta', { property: 'og:description', content: 'Framework Base e Biblioteca Central da Rede ArqenMC' }]
  ],

  themeConfig: {
    siteTitle: '⚡ ArqenCore',

    nav: [
      { text: 'Início', link: '/' },
      { text: 'Instalação', link: '/getting-started/installation' },
      {
        text: 'Módulos',
        items: [
          { text: 'Gerenciamento de YAMLs (YamlManager)', link: '/modules/yaml' },
          { text: 'Cores & Temas (theme.yml)', link: '/modules/theme' },
          { text: 'Criação de Itens (ItemBuilder)', link: '/modules/item-builder' },
          { text: 'Cooldowns Universais', link: '/modules/cooldowns' },
          { text: 'Notificações Temporizadas', link: '/modules/notifications' },
          { text: 'Graceful Shutdown & Ciclo de Vida', link: '/modules/lifecycle' },
          { text: 'Telemetria & Diagnóstico', link: '/modules/telemetry' },
          { text: 'Comandos (ACF)', link: '/modules/commands' },
          { text: 'Menus & GUIs (ObliviateInvs)', link: '/modules/gui' },
          { text: 'Concorrência & TPS (MCCoroutine)', link: '/modules/concurrency' },
          { text: 'Banco de Dados (Exposed)', link: '/modules/database' },
          { text: 'Mensagens (Adventure & MiniMessage)', link: '/modules/messages' },
          { text: 'Mundos & Schematics (FAWE)', link: '/modules/world' }
        ]
      },
      {
        text: 'v1.2.6',
        items: [
          { text: 'Repositório GitHub', link: 'https://github.com/s0sats/huskcore-docs' },
          { text: 'Guia de Instalação', link: '/getting-started/installation' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Primeiros Passos',
        collapsed: false,
        items: [
          { text: 'Visão Geral & Instalação', link: '/getting-started/installation' }
        ]
      },
      {
        text: 'Módulos do Framework',
        collapsed: false,
        items: [
          { text: 'Gerenciamento de YAMLs (YamlManager)', link: '/modules/yaml' },
          { text: 'Cores & Temas (theme.yml)', link: '/modules/theme' },
          { text: 'Criação de Itens (ItemBuilder)', link: '/modules/item-builder' },
          { text: 'Cooldowns Universais', link: '/modules/cooldowns' },
          { text: 'Notificações Temporizadas', link: '/modules/notifications' },
          { text: 'Graceful Shutdown & Ciclo de Vida', link: '/modules/lifecycle' },
          { text: 'Telemetria & Diagnóstico', link: '/modules/telemetry' },
          { text: 'Comandos (ACF)', link: '/modules/commands' },
          { text: 'Menus & GUIs (ObliviateInvs)', link: '/modules/gui' },
          { text: 'Concorrência & TPS (MCCoroutine)', link: '/modules/concurrency' },
          { text: 'Banco de Dados (Exposed)', link: '/modules/database' },
          { text: 'Mensagens & Cores (Adventure)', link: '/modules/messages' },
          { text: 'Mundos & Schematics (FAWE)', link: '/modules/world' }
        ]
      },
      {
        text: 'APIs & Especificações Técnicas',
        collapsed: true,
        items: [
          { text: 'Ciclo de Vida & Contexto', link: '/api/lifecycle-context' },
          { text: 'Economia Integrada (Vault)', link: '/api/economy' },
          { text: 'Itens & NBT Avançado', link: '/api/items-nbt-gui' },
          { text: 'Configuração de Banco de Dados', link: '/api/database' }
        ]
      }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Pesquisar documentação...',
                buttonAriaLabel: 'Pesquisar documentação'
              },
              modal: {
                noResultsText: 'Nenhum resultado encontrado para',
                resetButtonTitle: 'Limpar pesquisa',
                footer: {
                  selectText: 'para selecionar',
                  navigateText: 'para navegar',
                  closeText: 'para fechar'
                }
              }
            }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/s0sats/arqencore-docs' }
    ],

    footer: {
      message: 'Arquitetura de alta performance para servidores Minecraft.',
      copyright: 'Copyright © 2026 ArqenMC. Todos os direitos reservados.'
    },

    docFooter: {
      prev: 'Página Anterior',
      next: 'Próxima Página'
    },

    outline: {
      level: [2, 3],
      label: 'Nesta Página'
    },

    lastUpdated: {
      text: 'Atualizado em',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    returnToTopLabel: 'Voltar ao topo',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Aparência'
  }
})
