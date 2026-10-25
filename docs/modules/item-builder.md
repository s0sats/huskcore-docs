# Criação de Itens Fluente (`ItemBuilder`)

O `ItemBuilder` do **ArqenCore v1.2.5** foi totalmente aprimorado para oferecer uma API fluente de alta performance, integrada ao `XSeries` (suporte multi-versão 1.16.5 até 1.20+) e com **suporte nativo ao Adventure MiniMessage**, eliminando qualquer uso de códigos legados de cor com `§`.

---

## 1. Instanciação e Métodos Fluentes

Você pode instanciar o builder diretamente com `XMaterial`, `Material` nativo do Bukkit, por URL de skin ou através da DSL `buildItem`:

```kotlin
import com.arqenmc.item.ItemBuilder
import com.arqenmc.item.buildItem
import com.cryptomorin.xseries.XMaterial
import org.bukkit.inventory.ItemFlag

// Instanciação direta
val item = ItemBuilder(XMaterial.NETHERITE_SWORD)
    .name("<gradient:#FF5555:#FFAA00><bold>Espada Celestial</bold></gradient>")
    .lore(
        "<gray>Forjada nas chamas mais profundas.",
        "",
        "<bullet:arrow><primary>Dano Extra:</primary> <highlight>+15%</highlight>",
        "<bullet:arrow><primary>Raridade:</primary> <red>Lendária</red>"
    )
    .glow(true)
    .flags(ItemFlag.HIDE_ATTRIBUTES, ItemFlag.HIDE_ENCHANTS)
    .build()
```

---

## 2. Métodos de Formatação MiniMessage

Nenhum código manual de cores ou `§` é necessário. O `ItemBuilder` utiliza o serializador do Core para converter MiniMessage e gradientes RGB para componentes suportados pelo Spigot/Paper:

| Método | Assinatura | Descrição |
| :--- | :--- | :--- |
| **`name`** | `.name(miniMessage: String)` | Define o nome de exibição formatado com MiniMessage |
| **`lore`** | `.lore(vararg lines: String)` | Adiciona linhas de descrição com suporte a gradientes e tags |
| **`lore`** | `.lore(lines: List<String>)` | Sobrecarga recebendo uma lista de strings |
| **`glow`** | `.glow(enabled: Boolean = true)` | Aplica ou remove efeito de brilho/encantamento visual |
| **`flags`** | `.flags(vararg flags: ItemFlag)` | Adiciona flags de item (ex: esconder atributos) |

```kotlin
val bau = ItemBuilder(XMaterial.CHEST)
    .name("<primary><bold>Baú de Recompensas</bold></primary>")
    .lore(
        "<gray>Clique com o botão direito para abrir.",
        "<success>✔ Disponível diariamente</success>"
    )
    .glow()
    .build()
```

---

## 3. Cabeças Customizadas e Texturas de Skin

O ArqenCore integra resolução avançada de crânios de jogadores por nome, instância de `Player` ou textura Base64/URL:

### 3.1 Cabeça por Jogador (`skullOwner`)

```kotlin
// Por instância de Player ou OfflinePlayer
val cabecaPlayer = ItemBuilder(XMaterial.PLAYER_HEAD)
    .skullOwner(player)
    .name("<yellow>${player.name}</yellow>")
    .lore("<gray>Estatísticas do jogador.")
    .build()

// Por nome de usuário (String)
val cabecaPorNome = ItemBuilder(XMaterial.PLAYER_HEAD)
    .skullOwner("Notch")
    .name("<gold>Notch</gold>")
    .build()
```

### 3.2 Cabeça por Textura Base64 ou URL (`skullTexture`)

```kotlin
// Textura via URL oficial do Mojang Textures ou Base64
val texturaUrl = "http://textures.minecraft.net/texture/beb588b21a6f98ad1ff4e085c552dcb050efde970fb0499b247b9492a0180f3"

val cabecaCustom = ItemBuilder(XMaterial.PLAYER_HEAD)
    .skullTexture(texturaUrl)
    .name("<primary>Moeda de Ouro</primary>")
    .lore("<gray>Item comemorativo do evento.")
    .build()
```

---

## 4. Manipulação de NBT Integrada

Você pode anexar dados customizados diretamente no item sem conflitar com tags vanilla:

```kotlin
val ticket = ItemBuilder(XMaterial.PAPER)
    .name("<green>Ticket de Loteria #42</green>")
    .withNBT {
        set("lottery.id", 42)
        set("lottery.owner", player.uniqueId.toString())
        set("lottery.price", 250.0)
    }
    .build()

// Leitura posterior de NBT:
val builder = ticket.toBuilder()
val id = builder.getNBTInt("lottery.id")       // 42
val preco = builder.getNBTDouble("lottery.price") // 250.0
```

---

## 5. DSL Top-Level `buildItem`

Para criação declarativa concisa, utilize a DSL `buildItem`:

```kotlin
val machado = buildItem(XMaterial.DIAMOND_AXE) {
    name("<primary>Machado de Coleta</primary>")
    lore("<gray>Aumenta a velocidade de corte.")
    withAmount(1)
    glow()
}
```
