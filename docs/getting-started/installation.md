# Instalação & Primeiros Passos

O **ArqenCore** atua como uma biblioteca central e plugin standalone. Todos os plugins satélites da rede dependem do Core para ter acesso à injeção de contexto, banco de dados, menus, gerenciamento de tarefas assíncronas e notificações visuais.

---

## 1. Requisitos de Ambiente

- **Servidor:** Paper, Purpur ou Spigot (Minecraft 1.16.5 até 1.20+).
- **JVM Runtime:** Java 17 ou Java 21.
- **Build Tool:** Gradle com Kotlin DSL (`build.gradle.kts`).
- **Linguagem:** Kotlin 1.9.22+.

---

## 2. Publicação do Core no Maven Local

Como o ArqenCore é compartilhado entre os plugins, compile e publique o artefato no seu repositório local (`~/.m2/repository`):

```bash
# Na raiz do repositório ArqenCore:
./gradlew publishToMavenLocal
```

O artefato será gerado e catalogado sob as coordenadas:
- **Group:** `com.arqenmc`
- **Artifact:** `arqencore`
- **Version:** `1.2.5`

---

## 3. Configuração do Plugin Filho (`build.gradle.kts`)

No arquivo `build.gradle.kts` do seu plugin, declare o repositório `mavenLocal()` e adicione a dependência como `compileOnly` (pois o `ArqenCore.jar` já contém todas as bibliotecas sombreadas/relocadas em runtime no servidor):

```kotlin
plugins {
    kotlin("jvm") version "1.9.22"
    id("com.github.johnrengelman.shadow") version "7.1.2"
}

repositories {
    mavenLocal()
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    // API do Servidor (Spigot ou Paper)
    compileOnly("org.spigotmc:spigot-api:1.16.5-R0.1-SNAPSHOT")

    // ArqenCore Framework
    compileOnly("com.arqenmc:arqencore:1.2.5")
}

kotlin {
    jvmToolchain(21)
}
```

---

## 4. Declaração no `plugin.yml`

No arquivo `src/main/resources/plugin.yml` do seu plugin filho, declare a dependência oficial no **ArqenCore**:

```yaml
name: MeuPlugin
version: 1.0.0
main: com.arqenmc.meuplugin.MeuPlugin
api-version: '1.16'
author: ArqenMC
depend: [ArqenCore]
```

::: tip Retrocompatibilidade Nativa (`provides`)
O ArqenCore declara em seu manifesto a diretriz `provides: [Core, HuskCore]`. Plugins legados que ainda declaram `depend: [Core]` ou `depend: [HuskCore]` continuam sendo carregados normalmente pelo servidor sem nenhuma quebra de inicialização.
:::

::: tip Startup Prioritário
O `ArqenCore` carrega em estágio `STARTUP`, garantindo que toda a infraestrutura de Adventure, ACF, temas e pool de banco de dados esteja pronta quando o seu plugin for inicializado em `POSTWORLD`.
:::

---

## 5. Estrutura da Classe Principal (`Plugin`)

Ao contrário de plugins Bukkit convencionais que herdam de `JavaPlugin`, no ecossistema ArqenCore sua classe principal **deve herdar de `com.arqenmc.Plugin`**:

```kotlin
package com.arqenmc.meuplugin

import com.arqenmc.Plugin

class MeuPlugin : Plugin() {

    /**
     * Invocado automaticamente após a validação completa do contexto e da licença.
     * Registre comandos, listeners e tabelas de banco aqui.
     */
    override fun onStart() {
        context.logger.info("MeuPlugin iniciado com sucesso!")

        // Exemplo: Registro de comandos ACF
        registerCommands(MeuComando())

        // Exemplo: Registro de Listeners Bukkit
        registerListeners(MeuListener())
    }

    /**
     * Invocado na desativação do plugin.
     * Cancele tarefas específicas ou feche conexões locais.
     */
    override fun onStop() {
        context.logger.info("MeuPlugin desativado.")
    }
}
```

---

## 6. Próximos Passos

Explore os módulos do framework para acelerar seu desenvolvimento:

- [Sistema de Cores & MiniMessage (Theme)](/modules/theme)
- [Criação de Itens com MiniMessage (ItemBuilder)](/modules/item-builder)
- [Gerenciamento Universal de Cooldowns](/modules/cooldowns)
- [Notificações Visuais Temporizadas](/modules/notifications)
- [Comandos Declarativos com ACF](/modules/commands)
- [Menus Interativos com ObliviateInvs](/modules/gui)
- [Concorrência Segura com MCCoroutine](/modules/concurrency)
- [Banco de Dados Centralizado](/modules/database)
- [Graceful Shutdown & Eventos de Dados](/modules/lifecycle)
- [Comandos de Telemetria e Diagnóstico](/modules/telemetry)
