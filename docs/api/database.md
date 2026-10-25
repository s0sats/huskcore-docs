# Camada de Banco de Dados — ArqenCore

O ArqenCore fornece um gerenciador unificado de banco de dados baseado em **Exposed ORM** e **HikariCP**, projetado para suportar múltiplos motores relacionais com alta tolerância a falhas.

---

## 1. Motores Suportados

A enumeração `DatabaseType` aceita quatro modalidades:

| Tipo | Descrição | Driver Utilizado |
|---|---|---|
| `H2` | Banco relacional embutido em arquivo (padrão zero-config). | `org.h2.Driver` (H2 1.4.200) |
| `MYSQL` | Banco de dados MySQL clássico com SSL e UTF-8 configuráveis. | `com.mysql.cj.jdbc.Driver` |
| `MARIADB` | Banco de dados MariaDB nativo. | `org.mariadb.jdbc.Driver` |
| `POSTGRES` | Banco relacional PostgreSQL corporativo. | `org.postgresql.Driver` |

---

## 2. Configuração Externa (`database.yml`)

Quando o método `setupDatabase(..., configFromYml = true)` é chamado, o Core busca e valida as configurações no arquivo `database.yml` na pasta de dados do plugin:

```yaml
database:
  type: "POSTGRES"
  host: "localhost"
  port: 5432
  name: "arqenmc"
  username: "usuario_exemplo"
  password: "senha_exemplo"
  table-prefix: "arqen_"
  pool-size: 10
  connection-timeout: 30000
  validation-timeout: 5000
  ssl: false
```

* **Tratamento de Tipos Desconhecidos:** Caso o valor informado em `type` seja inválido ou não suportado (ex.: erro de digitação no YAML), o Core cai de forma segura e controlada para o tipo padrão `H2` sem lançar exceções não tratadas.

---

## 3. Resiliência e Fallback de Emergência (H2)

Se o banco de dados remoto estiver offline, com credenciais incorretas, ou se a rede falhar durante a inicialização:

1. A exceção original é registrada no logger com o host, porta e banco de dados que falharam.
2. O Core ativa instantaneamente o **banco local de emergência (H2)** localizado em:
   `plugins/<Plugin>/<plugin>.mv.db`
3. O servidor continua a inicialização sem crashar o processo principal.
4. As tabelas do plugin são automaticamente verificadas e migradas no banco de emergência.

---

## 4. Uso no Código

### 4.1 Inicialização no Plugin

```kotlin
import com.arqenmc.Plugin
import com.arqenmc.database.DatabaseManager

class ExemploPlugin : Plugin() {

    override fun onStart() {
        // Inicializa com tabelas Exposed e configuração do database.yml
        setupDatabase(
            UsuariosTable,
            TransacoesTable,
            configFromYml = true
        )
    }
}
```

### 4.2 Execução de Consultas

As consultas podem ser executadas tanto em bloco síncrono quanto suspenso (assíncrono):

```kotlin
// Operação suspensa (recomendada para evitar congelamento da thread principal do Bukkit)
context.scheduler.async {
    context.database?.suspendQuery {
        UsuariosTable.select { UsuariosTable.uuid eq playerUuid }.firstOrNull()
    }
}
```
