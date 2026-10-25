# Comandos com ACF (Aikar's Command Framework)

O ArqenCore integra nativamente o **ACF Bukkit `0.5.1-SNAPSHOT`**, permitindo declarar comandos, subcomandos, checagens de permissão e autocompletes de forma declarativa e expressiva, eliminando blocos repetitivos de `if (args.length == 0)`.

---

## 1. Estrutura de um Comando

Todo comando deve herdar de `co.aikar.commands.BaseCommand`. Injetamos as dependências necessárias (como o `PluginContext` e o `Scheduler`) através do construtor:

```kotlin
package com.arqenmc.meuplugin.command

import co.aikar.commands.BaseCommand
import co.aikar.commands.annotation.*
import com.arqenmc.context.PluginContext
import com.arqenmc.extension.message
import com.arqenmc.scheduler.Scheduler
import org.bukkit.command.CommandSender
import org.bukkit.entity.Player

@CommandAlias("carteira|wallet")
@CommandPermission("meuplugin.carteira.use")
@Description("Comando principal de gerenciamento de carteira")
class CarteiraCommand(
    private val context: PluginContext,
    private val scheduler: Scheduler
) : BaseCommand() {

    // ─── Subcomando Padrão (quando nenhum argumento é passado) ──────────────────

    @Default
    fun onDefault(player: Player) {
        player.message("<gray>Use <yellow>/carteira saldo <gray>ou <yellow>/carteira enviar<gray>.")
    }

    // ─── /carteira saldo [jogador] ─────────────────────────────────────────────

    @Subcommand("saldo|balance")
    @Syntax("[jogador]")
    @Description("Verifica seu saldo ou de outro jogador")
    @CommandCompletion("@players")
    fun onSaldo(sender: CommandSender, @Optional targetName: String?) {
        val target = targetName ?: sender.name
        sender.message("<gray>Consultando dados de <yellow>$target<gray>...")

        // Consulta assíncrona com retorno à Main Thread
        scheduler.async {
            val balance = 1500.0 // Simulação de busca no banco

            scheduler.sync {
                sender.message("<gray>O saldo de <yellow>$target <gray>é: <green>$$balance")
            }
        }
    }

    // ─── /carteira enviar <jogador> <valor> ─────────────────────────────────────

    @Subcommand("enviar|pay")
    @Syntax("<jogador> <valor>")
    @CommandCompletion("@players 10|50|100")
    @CommandPermission("meuplugin.carteira.enviar")
    fun onEnviar(
        player: Player,
        targetPlayer: Player, // O ACF resolve jogadores online automaticamente
        @Conditions("min=1") amount: Double
    ) {
        if (player.uniqueId == targetPlayer.uniqueId) {
            player.message("<red>Você não pode transferir dinheiro para você mesmo.")
            return
        }

        player.message("<green>Você enviou <gold>$$amount <green>para <yellow>${targetPlayer.name}!")
        targetPlayer.message("<green>Você recebeu <gold>$$amount <green>de <yellow>${player.name}!")
    }
}
```

---

## 2. Registro do Comando

### 2.1 Em Plugins Filhos (`Plugin.kt`)
Em qualquer classe que herde de `com.arqenmc.Plugin`, utilize o método auxiliar `registerCommands`:

```kotlin
class MeuPlugin : Plugin() {

    override fun onStart() {
        registerCommands(
            CarteiraCommand(context, scheduler),
            AdminCommand(context, scheduler)
        )
    }
}
```

### 2.2 No Core Standalone (`Core.kt`)
Se estiver adicionando comandos ao plugin central:

```kotlin
Context.commands.registerCommand(CarteiraCommand(context, scheduler))
```

---

## 3. Autocompletes Dinâmicos (`@CommandCompletion`)

Você pode registrar listas de autocompletion personalizadas que atualizam em tempo real:

```kotlin
// Registro de autocompletes na inicialização (onStart)
Context.commands.commandCompletions.registerCompletion("moedas_disponiveis") {
    listOf("ouro", "diamante", "esmeralda", "rubi")
}

Context.commands.commandCompletions.registerAsyncCompletion("arenas_ativas") {
    // Busca assíncrona se necessário
    listOf("arena-1", "arena-2", "arena-vip")
}
```

No comando, referencie com `@`:

```kotlin
@Subcommand("entrar")
@Syntax("<arena>")
@CommandCompletion("@arenas_ativas")
fun onEntrar(player: Player, arenaNome: String) {
    player.message("<gray>Entrando na arena <yellow>$arenaNome<gray>...")
}
```

---

## 4. Anotações Essenciais do ACF

| Anotação | Finalidade | Exemplo |
| :--- | :--- | :--- |
| `@CommandAlias` | Define o comando raiz e seus atalhos | `@CommandAlias("loja\|shop")` |
| `@Subcommand` | Define um subcomando filho | `@Subcommand("comprar")` |
| `@CommandPermission` | Permissão necessária do Bukkit | `@CommandPermission("loja.admin")` |
| `@Syntax` | Mensagem de sintaxe em caso de argumentos inválidos | `@Syntax("<item> <quantidade>")` |
| `@Optional` | Marca um parâmetro como não obrigatório | `target: String?` |
| `@Default` | Define o subcomando acionado sem argumentos ou valor padrão | `@Default("1") amount: Int` |
| `@CommandCompletion` | Sugestões no chat ao pressionar TAB | `@CommandCompletion("@players 1\|10")` |
