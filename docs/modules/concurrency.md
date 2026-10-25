# Concorrência, Corrotinas e Proteção de TPS

O Minecraft opera sob um ciclo de tick principal (**Main Thread**) com um orçamento de tempo rigoroso de **50 milissegundos por tick** (20 TPS). Se qualquer processo demorar mais do que 50ms, o servidor sofre congelamento imediato (Tick Lag), gerando desync e teleportes de jogadores.

O ArqenCore integra o **MCCoroutine `2.5.0`** através da classe utilitária `Scheduler`, permitindo escrever código assíncrono sequencial, legível e seguro sem travar o servidor.

---

## 1. O Componente `Scheduler`

Toda instância de plugin derivada de `com.arqenmc.Plugin` possui acesso direto à propriedade `scheduler`.

### 1.1 Métodos Principais

```kotlin
// 1. Execução Assíncrona (Dispatchers.IO)
// Ideal para: chamadas de banco de dados, requisições HTTP e leitura de arquivos
scheduler.async {
    val dados = carregarDadosDoBanco()
    
    // Retorna com segurança à Main Thread para interagir com o jogador
    scheduler.sync {
        player.inventory.addItem(dados.item)
    }
}

// 2. Atraso Não-Bloqueante (Delay)
scheduler.delay(5.seconds) {
    player.message("<gold>5 segundos se passaram sem bloquear o servidor!")
}

// 3. Tarefa Periódica Repetitiva
scheduler.repeat(every = 30.seconds, initialDelay = 5.seconds) {
    verificarStatusServidor()
}

// 4. Cancelamento Geral
// Cancela todas as tarefas ativas controladas por este scheduler
scheduler.cancelAll()
```

### 1.2 Extensões de Tempo Idiomáticas

O ArqenCore inclui extension functions para declarar intervalos de tempo com legibilidade máxima:

```kotlin
import com.arqenmc.scheduler.*

10.ticks      // 500 ms (10 * 50ms)
5.seconds     // 5.000 ms
2.minutes     // 120.000 ms
1.hours       // 3.600.000 ms
```

---

## 2. As Duas Regras de Ouro do Bukkit

::: danger Regra de Ouro 1: NUNCA faça I/O síncrono na Main Thread
- **Proibido na Main Thread**: Queries síncronas do Exposed (`DatabaseManager.query { ... }`), requisições HTTP via Ktor, gravação de schematics com FAWE ou leitura de arquivos pesados.
- **Consequência**: Queda drástica de TPS, spikes no Spark e travamento de entidades.
:::

::: danger Regra de Ouro 2: NUNCA altere entidades ou blocos fora da Main Thread
- **Proibido fora da Main Thread**: Modificar blocos (`block.setType(...)`), teleportar jogadores (`player.teleport(...)`), dar itens (`player.inventory.addItem(...)`) ou despachar eventos síncronos.
- **Consequência**: `IllegalStateException: Asynchronous entity/block access`, corrupção irrecuperável de mundos e crashes no processo JVM.
:::

---

## 3. Padrão Oficial: Operação Assíncrona com Retorno à Main Thread

Sempre que uma ação exigir consulta externa ou cálculo pesado com posterior alteração no mundo do jogo, siga o padrão assíncrono -> síncrono:

```kotlin
fun processarRecompensa(player: Player, rewardId: String) {
    player.message("<gray>Processando seu resgate...")

    scheduler.async {
        // ETAPA 1 (Assíncrona): I/O no banco de dados sem pesar na Main Thread
        val valido = context.database?.suspendQuery {
            // Consulta Exposed ORM em Dispatchers.IO
            TabelaRecompensas.select { 
                TabelaRecompensas.id eq rewardId 
            }.singleOrNull() != null
        } ?: false

        // ETAPA 2 (Síncrona): Retorno seguro à Main Thread
        scheduler.sync {
            // Validação obrigatória pós-suspensão: o jogador ainda está online?
            if (!player.isOnline) return@sync

            if (valido) {
                player.inventory.addItem(ItemBuilder(XMaterial.NETHER_STAR).build())
                player.message("<green>Recompensa resgatada com sucesso!")
            } else {
                player.message("<red>Recompensa inválida ou já utilizada.")
            }
        }
    }
}
```

---

## 4. Gestão de Memória e Auto-Expurgo de Tarefas

O `Scheduler` do ArqenCore utiliza internamente `ConcurrentHashMap.newKeySet<Job>()` e anexa um gancho de auto-limpeza em cada corrotina:

```kotlin
private fun track(job: Job): Job {
    jobs.add(job)
    job.invokeOnCompletion { jobs.remove(job) }
    return job
}
```

- Quando a tarefa termina normalmente ou sofre cancelamento, ela **se desregistra automaticamente**, impedindo que instâncias concluídas ocupem memória RAM.
- No `onStop()` do plugin, o Core chama automaticamente `scheduler.cancelAll()`, garantindo que nenhuma thread fique órfã após um recarregamento (`/reload`).
