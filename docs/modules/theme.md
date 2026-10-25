# Sistema de Cores e Temas (`theme.yml`)

O **ArqenCore v1.2.5** introduz um sistema centralizado de identidade visual baseado no arquivo `theme.yml`. Ele unifica a paleta de cores e o prefixo institucional em todo o ecossistema de plugins, permitindo que todas as mensagens utilizem tags declarativas nativas do **Adventure MiniMessage**.

---

## 1. Central de Temas (`plugins/ArqenCore/theme.yml`)

As definições visuais residem exclusivamente no diretório do **ArqenCore**. Ao alterar as cores neste arquivo, **todos** os plugins filhos que usam as tags passam a exibir a nova identidade visual automaticamente.

```yaml
theme:
  # Prefixo oficial inserido pela tag <prefix>
  prefix: "<dark_gray>[<gold><bold>Arqen</bold></gold><dark_gray>] "

  # Paleta de cores principal
  primary: "#FFAA00"      # Cor de destaque principal (ex: ouro/laranja)
  secondary: "#FF7700"    # Cor secundária de suporte
  highlight: "#FFFF55"    # Destaque de elementos/parâmetros (amarelo)
  success: "#55FF55"      # Confirmações e operações concluídas (verde)
  error: "#FF5555"        # Falhas, avisos graves e alertas (vermelho)
```

::: tip Suporte a Hexadecimal e Nomes Padrão
Os valores de cor aceitam notações hexadecimais de 6 dígitos (`#FFAA00`) ou nomes nativos de cores do Minecraft (`gold`, `green`, `red`, etc.).
:::

---

## 2. Tags Nativas no MiniMessage

Todas as mensagens enviadas por `player.message(...)`, `sender.message(...)` ou serializadas via `Context.colorize(...)` resolvem automaticamente as seguintes tags customizadas:

| Tag | Tipo | Descrição | Exemplo de Uso |
| :--- | :---: | :--- | :--- |
| **`<prefix>`** | Inserção | Insere o prefixo formatado configurado em `theme.yml` | `"<prefix><primary>Servidor iniciado!</primary>"` |
| **`<primary>`** | Estilo / Cor | Aplica a cor de destaque principal | `"<primary>Texto em destaque principal</primary>"` |
| **`<secondary>`** | Estilo / Cor | Aplica a cor secundária da rede | `"<secondary>Texto secundário</secondary>"` |
| **`<highlight>`** | Estilo / Cor | Destaca valores, argumentos e números | `"O seu saldo é <highlight>R$ 5.000</highlight>."` |
| **`<success>`** | Estilo / Ícone | Estiliza em verde de sucesso ou insere ícone `✔` | `"<success>Transação realizada com sucesso!</success>"` |
| **`<error>`** | Estilo / Ícone | Estiliza em vermelho de erro ou insere ícone `✖` | `"<error>Você não possui permissão para executar este comando!</error>"` |

---

## 3. Exemplos Práticos de Uso

### 3.1 Mensagens de Sucesso e Erro com Prefixo

```kotlin
// Em qualquer comando ou listener de plugin filho:
player.message("<prefix><success>Você recebeu <highlight>10x Diamantes</highlight> com sucesso!</success>")

// Notificação de erro padronizada:
player.message("<prefix><error>Saldo insuficiente para concluir a transação!</error>")
```

### 3.2 Inserção de Ícones

Caso deseje exibir o ícone indicativo antes do texto, utilize o argumento `:icon`:

```kotlin
// Renderiza: ✔ Compra aprovada!
player.message("<success:icon><success>Compra aprovada!</success>")

// Renderiza: ✖ Item esgotado!
player.message("<error:icon><error>Item esgotado!</error>")
```

### 3.3 Estruturação com Divisores e Cabeçalhos

O `CoreTagResolver` também oferece tags estruturais integradas:

```kotlin
player.message("<header:Minha Loja:gold>")
player.message("<bullet:arrow><primary>Item 1:</primary> <highlight>R$ 100</highlight>")
player.message("<bullet:arrow><primary>Item 2:</primary> <highlight>R$ 250</highlight>")
player.message("<divider:thin>")
```

---

## 4. Como os Plugins Filhos Acessam as Cores Programaticamente

Caso precise da cor em formato de componente ou objeto `TextColor`:

```kotlin
import com.arqenmc.theme.ThemeManager

val primaryHex = ThemeManager.primary
val prefix = ThemeManager.prefix
```
