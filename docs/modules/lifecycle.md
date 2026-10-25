# Ciclo de Vida, Graceful Shutdown & Eventos Assíncronos

O **ArqenCore v1.2.5** implementa uma arquitetura robusta de ciclo de vida projetada para garantir **anti-rollback absoluto** no desligamento do servidor e **zero-lag** durante a entrada e saída de jogadores.

---

## 1. Protocolo de Graceful Shutdown (5 Passos Sequenciais)

No encerramento do servidor (`Core.onDisable()`), o ArqenCore executa uma sequência ordenada de desligamento antes de liberar os recursos do banco de dados:

```
[Passo 1: Corte de Entradas]
       │  (Cancela timers periódicos, Scoreboard e tasks de tick)
       ▼
[Passo 2: Flush dos Filhos]
       │  (Dispara salvamento de emergência AsyncPlayerDataSaveEvent para jogadores online)
       ▼
[Passo 3: Drenagem de Corrotinas (Drain Phase)]
       │  (Aguardando até 10s para conclusão de transações pendentes)
       ├──► [Sucesso] ──┐
       └──► [Timeout] ──┴─► Trava Fail-Safe Anti-Zumbi (forceCancelAll)
                        │
                        ▼
[Passo 4: Fechamento do HikariCP]
       │  (database.close() com segurança total)
       ▼
[Passo 5: Limpeza de Singletons]
          (Encerramento do Adventure e expurgo de caches estáticos)
```

### 1.1 Detalhamento das Fases:
1. **Corte de Entradas:** Cancela imediatamente `ScoreboardManager`, `EconomyManager`, tarefas Bukkit e todas as corrotinas de repetição periódica (`Scheduler.cancelAllRepeating()`), impedindo a criação de novos trabalhos.
2. **Flush dos Filhos:** Para cada jogador conectado, emite `AsyncPlayerDataSaveEvent(uuid, name, isAsync = false)` permitindo que os plugins filhos salvem seus dados em cache.
3. **Drenagem de Corrotinas (Drain Phase):** O Core aguarda via `runBlocking` até que todas as tarefas assíncronas do `Scheduler` (especialmente transações `suspendQuery`) concluam suas gravações no banco:
   - Emite: `"[ArqenCore] Aguardando X tarefas assíncronas finalizarem antes de fechar o banco..."`
4. **Trava Fail-Safe Anti-Zumbi:** Se o banco ou alguma corrotina travar além do limite de **10 segundos**, o Core dispara alerta crítico e força a interrupção (`forceCancelAll()`), garantindo que o servidor finalize o processo na máquina sem ficar em loop infinito (servidor zumbi):
   - Alerta: `"[ArqenCore] Timeout no Graceful Shutdown! Forçando encerramento para evitar processo zumbi"`
5. **Fechamento do Pool HikariCP:** O pool de conexões com o banco só é finalizado após a drenagem completa.
6. **Limpeza de Singletons:** Libera `BukkitAudiences` e limpa caches estáticos em memória.

---

## 2. Eventos Assíncronos de Dados de Jogadores

Para evitar congelamento de ticks (`TPS drop`) ao carregar ou salvar perfis de jogadores no banco de dados, o ArqenCore disponibiliza dois eventos Bukkit dedicados:

### 2.1 `AsyncPlayerDataLoadEvent` (Carregamento no Pré-Login)

Disparado em thread assíncrona durante o `AsyncPlayerPreLoginEvent`. Ideal para buscar dados no banco antes de o jogador entrar no mundo:

```kotlin
package com.arqenmc.meuplugin.listener

import com.arqenmc.event.player.AsyncPlayerDataLoadEvent
import com.arqenmc.meuplugin.MeuPlugin
import org.bukkit.event.EventHandler
import org.bukkit.event.Listener

class PlayerDataListener(private val plugin: MeuPlugin) : Listener {

    @EventHandler
    fun onDataLoad(event: AsyncPlayerDataLoadEvent) {
        val uuid = event.playerUUID
        val name = event.playerName

        // Executado em segundo plano: não afeta o tick do servidor!
        plugin.context.database?.query {
            // Carrega dados da tabela de jogadores
            // TabelaJogadores.select { TabelaJogadores.uuid eq uuid }...
        }
    }
}
```

### 2.2 `AsyncPlayerDataSaveEvent` (Salvamento no Logout e Shutdown)

Disparado assincronamente quando um jogador sai do servidor (`PlayerQuitEvent`) e sincronamente como fallback de emergência durante o shutdown do servidor:

```kotlin
package com.arqenmc.meuplugin.listener

import com.arqenmc.event.player.AsyncPlayerDataSaveEvent
import com.arqenmc.meuplugin.MeuPlugin
import org.bukkit.event.EventHandler
import org.bukkit.event.Listener

class PlayerSaveListener(private val plugin: MeuPlugin) : Listener {

    @EventHandler
    fun onDataSave(event: AsyncPlayerDataSaveEvent) {
        val uuid = event.playerUUID

        // Persiste as alterações no banco de dados com segurança
        plugin.context.database?.query {
            // TabelaJogadores.update({ TabelaJogadores.uuid eq uuid }) { ... }
        }
    }
}
```

::: tip Proteção Anti-Rollback Integrada
Como o `Core.onDisable()` aguarda na fase de drenagem até 10 segundos, qualquer gravação disparada no `AsyncPlayerDataSaveEvent` tem a garantia de ser concluída no banco antes que o pool HikariCP seja desligado!
:::
