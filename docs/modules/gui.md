# Menus e Interfaces (ObliviateInvs)

O ArqenCore encapsula a biblioteca **ObliviateInvs `4.3.0`** através da classe base `GuiAdapter`, fornecendo uma forma limpa, declarativa e reativa de criar inventários interativos (GUIs) sem a necessidade de criar `InventoryClickEvent` listeners avulsos.

---

## 1. Arquitetura do `GuiAdapter`

A classe base `GuiAdapter` estende `mc.obliviate.inventory.Gui` e automatiza a leitura de itens através de uma **matriz de caracteres (`pattern`)**, ligando cada caractere a uma configuração de item e uma ação de clique.

### Vantagens do Padrão:
- **Sem Memory Leaks**: Listeners de inventário são registrados e descartados automaticamente.
- **Itens Multi-versão**: Integração nativa com `XSeries` (`XMaterial`, `XSkull`).
- **Layout Declarativo**: Você desenha a tela no código ou arquivo YAML usando caracteres.

---

## 2. Exemplo Prático: Menu com Layout Declarativo

### 2.1 Criando a Classe do Menu

```kotlin
package com.arqenmc.meuplugin.gui

import com.arqenmc.context.Context
import com.arqenmc.extension.message
import com.arqenmc.inventory.GuiAdapter
import com.arqenmc.inventory.model.InventoryConfig
import com.arqenmc.inventory.model.ItemConfig
import com.arqenmc.item.ItemBuilder
import com.cryptomorin.xseries.XMaterial
import mc.obliviate.inventory.Icon
import mc.obliviate.inventory.advancedslot.AdvancedSlotManager
import org.bukkit.entity.Player

class LojaMenu(
    private val player: Player
) : GuiAdapter(
    player = player,
    config = InventoryConfig(
        title = "<gradient:#ff8a00:#e52e71>Loja do Servidor</gradient>",
        pattern = listOf(
            "#########",
            "#  D E  #",
            "#   B   #",
            "#########"
        ),
        items = mapOf(
            "borda" to ItemConfig(
                code = "#",
                material = "BLACK_STAINED_GLASS_PANE",
                name = "<dark_gray> ",
                action = "NENHUMA"
            ),
            "diamante" to ItemConfig(
                code = "D",
                material = "DIAMOND",
                name = "<aqua><bold>Comprar Diamantes</bold></aqua>",
                lore = listOf(
                    "<gray>Preço: <gold>100 moedas",
                    "",
                    "<yellow>Clique para adquirir!"
                ),
                action = "COMPRAR_DIAMANTE"
            ),
            "esmeralda" to ItemConfig(
                code = "E",
                material = "EMERALD",
                name = "<green><bold>Comprar Esmeraldas</bold></green>",
                lore = listOf(
                    "<gray>Preço: <gold>250 moedas",
                    "",
                    "<yellow>Clique para adquirir!"
                ),
                action = "COMPRAR_ESMERALDA"
            ),
            "fechar" to ItemConfig(
                code = "B",
                material = "BARRIER",
                name = "<red><bold>Fechar Menu</bold></red>",
                action = "FECHAR"
            )
        )
    )
) {

    /**
     * Invocado automaticamente para cada slot mapeado no pattern.
     */
    override fun configureSlotAction(
        slot: Int,
        adv: AdvancedSlotManager,
        icon: Icon,
        action: String
    ) {
        when (action.uppercase()) {
            "COMPRAR_DIAMANTE" -> icon.onClick {
                player.inventory.addItem(ItemBuilder(XMaterial.DIAMOND).withAmount(1).build())
                player.message("<green>Você comprou <aqua>1x Diamante<green>!")
            }

            "COMPRAR_ESMERALDA" -> icon.onClick {
                player.inventory.addItem(ItemBuilder(XMaterial.EMERALD).withAmount(1).build())
                player.message("<green>Você comprou <green>1x Esmeralda<green>!")
            }

            "FECHAR" -> icon.onClick {
                player.closeInventory()
            }

            "NENHUMA" -> icon.onClick {
                // Apenas cancela o clique (ação padrão do Icon)
            }
        }
    }
}
```

### 2.2 Abrindo o Menu para o Jogador

```kotlin
// Em um comando ou evento:
LojaMenu(player).open()
```

---

## 3. Construção Fluente de Itens (`ItemBuilder`)

O ArqenCore disponibiliza o utilitário `ItemBuilder` integrado ao `XSeries`:

```kotlin
import com.arqenmc.item.ItemBuilder
import com.cryptomorin.xseries.XMaterial
import org.bukkit.enchantments.Enchantment
import org.bukkit.inventory.ItemFlag

val espadaLendaria = ItemBuilder(XMaterial.NETHERITE_SWORD)
    .withName("<gradient:#ff0844:#ffb199>Lâmina Flamejante</gradient>")
    .withLore(
        "<gray>Uma espada lendária forjada no Nether.",
        "",
        "<yellow>Dano: <red>+15",
        "<gold>Exclusivo para Guerreiros"
    )
    .withEnchantment(Enchantment.DAMAGE_ALL, 5)
    .withItemFlags(ItemFlag.HIDE_ENCHANTS)
    .withGlow()
    .build()
```

### Cabeças Personalizadas (Custom Skulls):
```kotlin
// Cria cabeça a partir de URL do Minecraft-Heads ou Base64:
val cabecaMago = ItemBuilder("http://textures.minecraft.net/texture/...")
    .withName("<purple>Chapéu de Mago")
    .build()
```

---

## 4. Paginação com `PaginationManager`

Para menus de lista longa (ex: top jogadores, recompensas ou leilões), o ObliviateInvs possui suporte nativo a paginação através de slots reservados para avanço e retrocesso de páginas.

```kotlin
class InventarioPaginado(player: Player) : Gui(player, "id-leilao", "Leilão do Servidor", 6) {

    override fun onOpen(event: InventoryOpenEvent) {
        val pagination = PaginationManager(this).apply {
            registerPageSlotsBetween(10, 43) // Slots onde os itens aparecem
        }

        val itensLeilao = carregarItens()
        itensLeilao.forEach { item ->
            pagination.addItem(Icon(item).onClick {
                player.message("<green>Item selecionado!")
            })
        }

        // Botão Página Anterior
        addItem(48, Icon(ItemBuilder(XMaterial.ARROW).withName("<yellow>← Página Anterior").build())
            .onClick { pagination.previousPage(); update() })

        // Botão Próxima Página
        addItem(50, Icon(ItemBuilder(XMaterial.ARROW).withName("<yellow>Próxima Página →").build())
            .onClick { pagination.nextPage(); update() })

        pagination.update()
    }
}
```
