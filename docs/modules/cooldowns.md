# Gerenciamento Universal de Cooldowns (`CooldownManager`)

O **ArqenCore v1.2.5** introduz o `CooldownManager`, um sistema universal, thread-safe e de alta performance para gerenciar tempos de recarga de habilidades, comandos e ações de jogadores.

---

## 1. Princípios de Arquitetura

- **Thread-Safety Total:** Estruturado internamente sobre coleções concorrentes (`ConcurrentHashMap<UUID, ConcurrentHashMap<String, Long>>`), permitindo consultas e definições em threads síncronas e assíncronas sem race conditions.
- **Prevenção Ativa de Memory Leak:** No evento de logout (`PlayerQuitEvent`), todos os cooldowns associados ao `UUID` do jogador são imediatamente expurgados da memória RAM pelo `PlayerSessionListener`.
- **Extension Functions Fluentes:** Métodos integrados diretamente na classe `org.bukkit.entity.Player`.

---

## 2. Métodos Disponíveis em `Player`

| Método | Retorno | Descrição |
| :--- | :---: | :--- |
| **`player.setCooldown(key, duration)`** | `Unit` | Registra um cooldown com chave identificadora e duração em milissegundos |
| **`player.hasCooldown(key)`** | `Boolean` | Retorna `true` se o jogador ainda estiver no tempo de recarga |
| **`player.getCooldownRemaining(key)`** | `Long` | Retorna o tempo restante em milissegundos (ou `0L` se expirado) |
| **`player.getCooldownFormatted(key)`** | `String` | Retorna o tempo restante formatado (ex: `"2.4s"` ou `"01:30"`) |
| **`player.removeCooldown(key)`** | `Unit` | Remove o cooldown manualmente antes da expiração |

---

## 3. Exemplo Prático: Bloqueio de Comandos e Habilidades

```kotlin
import com.arqenmc.extension.getCooldownFormatted
import com.arqenmc.extension.hasCooldown
import com.arqenmc.extension.message
import com.arqenmc.extension.setCooldown
import com.arqenmc.scheduler.seconds
import org.bukkit.entity.Player

fun executarPoderEspecial(player: Player) {
    val cooldownKey = "habilidade_raio"

    // 1. Verificação de Cooldown ativo
    if (player.hasCooldown(cooldownKey)) {
        val restante = player.getCooldownFormatted(cooldownKey)
        player.message("<prefix><error>Aguarde <highlight>$restante</highlight> para usar este poder novamente!</error>")
        return
    }

    // 2. Aplicação da Ação
    player.world.strikeLightning(player.location)
    player.message("<prefix><success>Você conjurou o raio divino!</success>")

    // 3. Aplicação do Cooldown (ex: 15 segundos)
    player.setCooldown(cooldownKey, 15.seconds)
}
```

---

## 4. Regras de Formatação Inteligente (`getCooldownFormatted`)

O método `player.getCooldownFormatted(key)` adapta o formato de exibição de acordo com o tempo restante:

- **Abaixo de 1 minuto:** Formatação com casa decimal para precisão dinâmica:
  - `2400ms` $\rightarrow$ `"2.4s"`
  - `500ms` $\rightarrow$ `"0.5s"`
- **Acima de 1 minuto:** Formatação clássica em minutos e segundos:
  - `90000ms` (1 minuto e 30 segundos) $\rightarrow$ `"01:30"`
  - `300000ms` (5 minutos) $\rightarrow$ `"05:00"`
- **Expirado ou Inexistente:** Retorna `"0s"`.

---

## 5. Acesso Estático Direto (`CooldownManager`)

Para operações fora do contexto de um jogador online (por exemplo, tarefas de background com apenas o `UUID`):

```kotlin
import com.arqenmc.cooldown.CooldownManager
import java.util.UUID

val uuid: UUID = ...
CooldownManager.setCooldown(uuid, "teleport", 3000L)

if (CooldownManager.hasCooldown(uuid, "teleport")) {
    val formatted = CooldownManager.getFormatted(uuid, "teleport")
}
```
