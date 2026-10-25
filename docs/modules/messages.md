# Mensagens e Formatação (Adventure & MiniMessage)

O ArqenCore adota a biblioteca **Kyori Adventure `4.14.0`** com o parser **MiniMessage**, abandonando definitivamente as seções de cores legadas baseadas em `§` ou no enum depreciado `ChatColor`.

---

## 1. Por que abolir o `§` e o `ChatColor`?

- **Cores Hexadecimais (RGB)**: O Minecraft moderno suporta 16 milhões de cores, impossíveis de expressar com os 16 códigos clássicos `§0`-`§f`.
- **Gradientes e Transições**: O MiniMessage permite criar degradês suaves entre cores RGB.
- **Interatividade Completa**: Suporte nativo a eventos de clique (`clickEvent`), balões de texto ao passar o mouse (`hoverEvent`) e inserções de chat.
- **Segurança contra Injeção**: Tags fechadas evitam que a cor de uma linha "vaze" acidentalmente para as próximas mensagens do chat.

::: danger Proibição Estrita de Códigos Legados
É expressamente proibido o uso de `§`, `ChatColor` ou `&` crus no código-fonte do Core e plugins da ArqenMC. Utilize exclusivamente tags MiniMessage.
:::

---

## 2. Enviando Mensagens (`Extension Functions`)

O ArqenCore disponibiliza extensões fluentes no pacote `com.arqenmc.extension`:

```kotlin
import com.arqenmc.extension.message

// 1. Envio para Player com placeholders tipados
player.message("<gray>Olá, <yellow>{jogador}<gray>! Seu saldo é <gold>$$saldo<gray>.",
    "jogador" to player.name,
    "saldo" to "1.500,00"
)

// 2. Envio para múltiplos tipos de CommandSender (Console ou Player)
sender.message("<green>Operação executada com sucesso!")

// 3. Envio de listas de mensagens (linhas)
player.message(listOf(
    "<dark_gray>--------------------------------",
    "<gold><bold>INFORMAÇÕES DA SUA CONTA</bold></gold>",
    "<gray>Nível: <green>25",
    "<dark_gray>--------------------------------"
))
```

---

## 3. Sintaxe do MiniMessage

### 3.1 Cores Básicas e Hexadecimais
```
<red>Texto em vermelho</red>
<green>Texto em verde</green>
<gold>Texto em dourado</gold>
<#ff7675>Cor personalizada em Hexadecimal</#ff7675>
```

### 3.2 Gradientes e Arco-Íris (Rainbow)
```
<gradient:#12c2e9:#c471ed:#f64f59>Texto com Gradiente de 3 Cores</gradient>
<rainbow>Texto colorido com efeito de arco-íris</rainbow>
```

### 3.3 Decorações de Texto
```
<bold>Texto em Negrito</bold>
<italic>Texto em Itálico</italic>
<underlined>Texto Sublinhado</underlined>
<st>Texto Riscado (Strikethrough)</st>
```

### 3.4 Interatividade (Hover e Click)
```
<hover:show_text:'<gray>Clique para executar o comando'><click:run_command:'/spawn'><yellow>[Clique Aqui para ir ao Spawn]</yellow></click></hover>

<hover:show_text:'<green>Visite nosso site oficial'><click:open_url:'https://arqenmc.com.br'><aqua><underlined>https://arqenmc.com.br</underlined></aqua></click></hover>
```

---

## 4. Tags Exclusivas do `CoreTagResolver`

O ArqenCore expande o MiniMessage padrão com tags utilitárias exclusivas:

| Tag | Finalidade | Exemplo de Saída |
| :--- | :--- | :--- |
| `<kbd>TECLA</kbd>` | Renderiza a tecla como um botão estilizado `[TECLA]` | `<kbd>SHIFT</kbd>` → `[SHIFT]` |
| `<kbd:gold>TECLA</kbd>` | Renderiza o botão com uma cor específica | `[Q]` estilizado em dourado |
| `<center>TEXTO</center>` | Centraliza a linha no chat com base na largura da fonte | Centralizado horizontalmente |
| `<upper>texto</upper>` | Converte o conteúdo para letras MAIÚSCULAS | `texto` → `TEXTO` |
| `<lower>TEXTO</lower>` | Converte o conteúdo para letras minúsculas | `TEXTO` → `texto` |

### Exemplo de Uso:
```kotlin
player.message("<center><gold><bold>EVENTO DE GLADIADOR</bold></gold></center>")
player.message("<gray>Pressione <kbd>SHIFT</kbd> para agachar e <kbd:red>F</kbd> para usar a habilidade.")
```

---

## 5. Conversão para Componentes e Strings Legadas

Quando for necessário interagir diretamente com a API do Adventure ou alimentar bibliotecas que ainda exigem texto legado:

```kotlin
// Gera Component do Adventure:
val componente: Component = Context.colorize("<gradient:#ff8a00:#e52e71>Título</gradient>")

// Converte para String formatada para títulos de inventário legado Spigot:
val legacyString: String = Context.colorizeToString("<gold>Inventário Especial")
```
