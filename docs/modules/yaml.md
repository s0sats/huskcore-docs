# Gerenciamento de YAMLs (`YamlManager`)

O **ArqenCore** disponibiliza o `YamlManager`, um componente de infraestrutura centralizado e resiliente para carregamento, versionamento, auto-migração e recuperação de arquivos YAML em plugins Bukkit/Paper.

---

## 1. Princípios de Arquitetura

- **Cache Thread-Safe:** Gerenciamento concorrente através de `ConcurrentHashMap`, permitindo leituras sem gargalos de I/O em múltiplos threads.
- **Forçamento de Charset UTF-8 Estrito:** Leitura e gravação operam rigorosamente com `StandardCharsets.UTF_8`, neutralizando falhas de codificação e caracteres corrompidos (*mojibake*, como `ç`, `ã`, `é`) em servidores Windows.
- **Injeção Fluente via Ciclo de Vida:** Disponível nativamente em qualquer plugin que herde da classe base `Plugin` através da propriedade delegada `yamls`.

```kotlin
import com.arqenmc.Plugin
import org.bukkit.configuration.file.YamlConfiguration

class MeuPlugin : Plugin() {

    lateinit var configuracao: YamlConfiguration

    override fun onStart() {
        // Carrega ou cria o arquivo na pasta do plugin:
        configuracao = yamls.loadOrCreate("config.yml")
        
        val servidor = configuracao.getString("servidor.nome", "Meu Servidor")
        val porta = configuracao.getInt("servidor.porta", 25565)
    }

    override fun onStop() {
        // Encerramento ordenado
    }
}
```

---

## 2. Como Funciona o `loadOrCreate`

Ao invocar `yamls.loadOrCreate(resourcePath)`:

1. **Se o arquivo NÃO existir no disco (`plugins/MeuPlugin/config.yml`):**
   - Cria os diretórios pai automaticamente caso não existam.
   - Extrai uma cópia idêntica do recurso presente no JAR (`plugin.saveResource(resourcePath, false)`), preservando integralmente comentários (`#`), espaçamentos e valores padrão.
   - Carrega a configuração em memória com codificação UTF-8, armazena no cache interno e a retorna.

2. **Se o arquivo JÁ existir no disco:**
   - Executa a **Guarda Fail-Safe contra Sintaxe Corrompida**.
   - Em seguida, avalia a **Auto-Atualização por `config-version`**.

---

## 3. Auto-Atualização por `config-version`

O `YamlManager` compara a chave inteira `config-version` do arquivo no disco com a versão compilada no JAR interno:

```yaml
# config.yml
config-version: 2

servidor:
  nome: "Servidor Exemplo"
  porta: 25565
  # Nova configuração adicionada na v2:
  timeout: 30
```

Se `diskVersion < jarVersion`:

1. **Criação de Backup:** Uma cópia fiel do arquivo atual do disco é gerada: `config.bak_v{diskVersion}.yml`.
2. **Retenção de Backups (Máximo 3):** O gerenciador lista os backups `.bak_v*.yml` existentes para aquele arquivo e mantém apenas os **3 mais recentes**, excluindo os mais antigos do disco automaticamente.
3. **Injeção Recursiva sem Sobrescrita:** Todas as novas chaves e seções adicionadas na nova versão do JAR são injetadas no arquivo do disco. Quaisquer valores customizados que o administrador do servidor já tenha alterado **são integralmente preservados**.
4. **Atualização da Chave:** A chave `config-version` do arquivo no disco é atualizada para `jarVersion`.
5. **Gravação e Log Informativo:** O arquivo é regravado em UTF-8 e o log é emitido no console:
   ```
   [YamlManager] Arquivo config.yml atualizado de v1 para v2 (Backup criado).
   ```

> [!NOTE]
> Comentários e chaves adicionadas na versão inicial são preservados durante a criação do arquivo e os backups garantem que alterações anteriores nunca sejam perdidas.

---

## 4. Guarda Fail-Safe contra Sintaxe Quebrada

Erros de sintaxe cometidos durante edições manuais (como indentação inconsistente ou chaves sem valor) normalmente causariam falhas graves na inicialização do servidor. O `YamlManager` neutraliza esse risco:

1. Ao tentar carregar o arquivo existente, se uma falha de sintaxe for identificada:
   - O arquivo defeituoso é imediatamente renomeado para:
     ```
     config.corrupted_{timestamp}.yml
     ```
     *(Garantindo que o trabalho de edição do administrador permaneça salvo para inspeção posterior).*
2. Um alerta crítico de severidade máxima é registrado no console com os detalhes da falha.
3. Uma cópia limpa e original do JAR é extraída imediatamente para `config.yml`.
4. O plugin prossegue com a inicialização normalmente, prevenindo que o servidor caia ou entre em estado inoperante.

> [!WARNING]
> Ao encontrar um arquivo `.corrupted`, verifique o log do console para identificar a linha e o caractere inválido inserido antes de reincorporar suas alterações.

---

## 5. Sistema de Backups Versionados

Para evitar acúmulo desnecessário de arquivos na pasta do plugin, a retenção de backups opera com política rigorosa:

- **Padrão de Nomenclatura:** `<nome-do-arquivo>.bak_v<versao>.<extensao>`
  - Exemplo: `config.bak_v1.yml`, `config.bak_v2.yml`, `config.bak_v3.yml`.
- **Limite de Retenção:** Máximo de **3 cópias** por arquivo.
- **Expurgo Automático:** Quando uma nova versão (ex: v4) é instalada e o backup `config.bak_v4.yml` é gerado, o backup mais antigo (`config.bak_v1.yml`) é removido automaticamente da máquina.

---

## 6. Métodos Auxiliares da API

Além de `loadOrCreate`, a instância `yamls` disponibiliza:

| Método | Retorno | Descrição |
| :--- | :---: | :--- |
| **`yamls.getConfig(path)`** | `YamlConfiguration` | Obtém a configuração em cache para o caminho informado (se não estiver em cache, executa `loadOrCreate`) |
| **`yamls.reload(path)`** | `YamlConfiguration` | Descarta o cache e recarrega o arquivo do disco com fail-safe e validação de versão |
| **`yamls.reloadAll()`** | `Unit` | Recarrega todos os arquivos YAML atualmente gerenciados e cacheados pelo plugin |
| **`yamls.save(path)`** | `Unit` | Salva explicitamente a configuração em cache no disco em UTF-8 estrito |
| **`yamls.saveAll()`** | `Unit` | Salva todas as configurações em cache no disco em UTF-8 estrito |

### Exemplo de Recarregamento em Comandos (`/reload`)

```kotlin
import co.aikar.commands.BaseCommand
import co.aikar.commands.annotation.CommandAlias
import co.aikar.commands.annotation.CommandPermission
import co.aikar.commands.annotation.Subcommand
import com.arqenmc.Plugin
import com.arqenmc.extension.message
import org.bukkit.command.CommandSender

@CommandAlias("meuplugin")
class MeuPluginCommand(private val plugin: Plugin) : BaseCommand() {

    @Subcommand("reload")
    @CommandPermission("meuplugin.admin")
    fun onReload(sender: CommandSender) {
        // Recarrega todos os arquivos YAML do plugin:
        plugin.yamls.reloadAll()

        sender.message("<prefix><success>Todas as configurações foram recarregadas com sucesso!</success>")
    }
}
```
