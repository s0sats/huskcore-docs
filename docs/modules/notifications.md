# Notificações Temporizadas no Jogador

O **ArqenCore v1.2.5** disponibiliza extensões nativas em `Player` para envio de mensagens temporizadas na **ActionBar** e na **BossBar**, totalmente integradas ao Kyori Adventure e MiniMessage.

---

## 1. ActionBars com Duração (`sendActionBar`)

Por padrão no protocolo do Minecraft vanilla, mensagens na ActionBar desaparecem após aproximadamente 2 segundos. A extensão `player.sendActionBar` permite definir durações personalizadas; o ArqenCore mantém a mensagem visível atualizando-a através de corrotinas até o tempo expirar:

```kotlin
import com.arqenmc.extension.sendActionBar
import com.arqenmc.scheduler.seconds

// Exibe por 3 segundos (duração padrão)
player.sendActionBar("<primary>Modo de Combate Ativado!</primary>")

// Exibe por 5 segundos com cores customizadas
player.sendActionBar("<gradient:#FF5555:#FFAA00>Zona Segura: Invulnerabilidade ativa</gradient>", duration = 5.seconds)
```

::: tip Cancelamento no Logout
Se o jogador se desconectar do servidor enquanto a ActionBar estiver ativa, a corrotina correspondente é cancelada imediatamente para não reter instâncias de objetos na memória.
:::

---

## 2. BossBars Temporárias (`showTemporaryBossBar`)

Crie e exiba BossBars ricas visualmente para contagens regressivas, avisos globais ou feedback de eventos sem necessidade de instanciar listeners complexos:

```kotlin
import com.arqenmc.extension.showTemporaryBossBar
import com.arqenmc.scheduler.seconds
import net.kyori.adventure.bossbar.BossBar

// Exemplo: Alerta de Evento com BossBar Roxa por 10 segundos
player.showTemporaryBossBar(
    message = "<bold><light_purple>Boss Mundial:</light_purple></bold> <white>Dragão do Vazio surgiu!</white>",
    progress = 1.0f,
    color = BossBar.Color.PURPLE,
    duration = 10.seconds
)
```

### Parâmetros Suportados:

| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| **`message`** | `String` | *Obrigatório* | Mensagem formatada com MiniMessage |
| **`progress`** | `Float` | `1.0f` | Preenchimento da barra de `0.0f` (vazio) a `1.0f` (cheio) |
| **`color`** | `BossBar.Color` | `PURPLE` | Cor da barra (`PINK`, `BLUE`, `RED`, `GREEN`, `YELLOW`, `PURPLE`, `WHITE`) |
| **`duration`** | `Long` | `5.seconds` | Tempo de permanência na tela em milissegundos |

---

## 3. Prevenção de Ghost BossBars

Um dos maiores problemas em servidores Bukkit tradicionais é o jogador deslogar e a BossBar permanecer "órfã" na tela ou no audience ao reconectar.

O ArqenCore monitora o ciclo de vida do jogador via [`NotificationManager`](/modules/notifications):
1. Quando o jogador desloga (`PlayerQuitEvent`), todas as instâncias ativas de `BossBar` são escondidas do audience.
2. Todas as corrotinas associadas àquele jogador são canceladas.
3. As referências são removidas das coleções do servidor.
