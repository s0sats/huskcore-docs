# Manipulação de Itens, NBT e Menus GUI — ArqenCore

Utilitários para manipulação de inventários, itens com metadados persistentes e interfaces gráficas.

---

## 1. Construção de Itens (`ItemBuilder`)

O `ItemBuilder` permite a montagem fluente de itens customizados, garantindo que alterações de propriedades como material preservem os metadados anteriores:

```kotlin
val espada = ItemBuilder(Material.DIAMOND_SWORD)
    .name("<gold>Lâmina Flamejante")
    .lore("<gray>Uma espada forjada nas chamas.", "<yellow>Dano: +10")
    .enchant(Enchantment.DAMAGE_ALL, 5)
    .glow()
    .build()
```

---

## 2. Manipulação de NBT (`ExNBT`)

Extensões diretas para leitura e escrita de NBT customizado em itens e blocos:

```kotlin
// Em ItemStack
val itemComDados = item.setNBT("minha_chave", "meu_valor")
val valor = itemComDados.getNBT<String>("minha_chave")

// Em Blocos (atualização imediata no mundo)
block.setNBT("proprietario", player.uniqueId.toString())
```

---

## 3. Interfaces Gráficas (`GuiAdapter` e `AnvilAdapter`)

Criação de inventários virtuais interativos com proteção de slots e validação de limites de linhas (1..6) e colunas (1..9):

```kotlin
val gui = GuiAdapter(linhas = 3, titulo = "<dark_green>Painel de Controle")

gui.setItem(linha = 2, coluna = 5, item = espada) { event ->
    event.isCancelled = true
    player.sendMessage("<green>Você clicou na espada!")
}

gui.open(player)
```
