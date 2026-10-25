# Ciclo de Vida e Contexto de Plugins — ArqenCore

O ArqenCore estrutura os plugins Bukkit através de uma arquitetura baseada em contexto desacoplado.

---

## 1. Estrutura de Classes

* **`com.arqenmc.Plugin`:** Ponto de entrada do plugin estendendo `JavaPlugin`. Fornece pontos de extensão como `onStart()`, `onStop()` e `onReload()`.
* **`com.arqenmc.context.PluginContext`:** Objeto central de injeção de dependências e estado. Fornece acesso ao logger, scheduler, banco de dados, leitor de configurações e manipuladores de eventos.

---

## 2. Ciclo de Vida do Plugin

Ao inicializar o servidor (`onEnable`), a classe `Plugin` executa a seguinte sequência controlada:

1. **Instanciação do `PluginContext`:** Configura diretórios de dados, gerenciador de tags de texto e despachante de exceções.
2. **Validação de Licença:** Se o plugin exigir verificação de licença, valida as credenciais e obtém o estado da assinatura.
3. **Chamada de `onStart()`:** O código do plugin consumidor é executado com ambiente e serviços devidamente instanciados.
4. **Registro de Serviços e Handlers:** Listener de eventos e rotinas em background são registrados no servidor.

No desligamento (`onDisable`):

1. **Chamada de `onStop()`:** Liberação ordenada de regras de negócio.
2. **Cancelamento de Corrotinas:** O `Scheduler` cancela imediatamente todas as tarefas pendentes via `cancelAll()`.
3. **Encerramento de Conexões:** O pool HikariCP do banco de dados é fechado graciosamente via `closeDatabase()`.
4. **Limpeza de Caches:** Caches de arquivos YAML e mapas voláteis de blocos são liberados da memória.

---

## 3. Compatibilidade Binária

Para garantir interoperabilidade estável com plugins dependentes já compilados (como o `ArqenCrypto`), o Core mantém métodos de extensão retrocompatíveis:

```kotlin
@Suppress("EXTENSION_SHADOWED_BY_MEMBER")
@Deprecated("Mantido para compatibilidade binária", level = DeprecationLevel.HIDDEN)
fun Plugin.setupDatabase(
    vararg tables: Table,
    configFromYml: Boolean = false,
): DatabaseManager = this@PluginContext.setupDatabase(*tables, configFromYml = configFromYml)
```

Essa convenção evita `NoSuchMethodError` mesmo quando o consumidor foi construído contra assinaturas legadas.
