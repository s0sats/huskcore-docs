# Banco de Dados (Exposed & HikariCP)

O ArqenCore fornece uma camada unificada de banco de dados baseada no **JetBrains Exposed ORM `0.33.1`** e no pool de alta performance **HikariCP `5.1.0`**, oferecendo tipagem estática, transações assíncronas e alta tolerância a falhas de rede.

---

## 1. Motores Relacionais Suportados

A enumeração `DatabaseType` aceita quatro modalidades:

| Tipo | Descrição | Driver Relocado no Core |
| :--- | :--- | :--- |
| **`H2`** | Banco embutido em arquivo (padrão zero-config) | `org.h2.Driver` (H2 1.4.200) |
| **`MYSQL`** | MySQL corporativo com SSL e UTF-8 configuráveis | `com.mysql.cj.jdbc.Driver` (v8.4.0) |
| **`MARIADB`** | MariaDB nativo com alto throughput | `org.mariadb.jdbc.Driver` (v3.4.1) |
| **`POSTGRES`** | PostgreSQL para redes de alta concorrência | `org.postgresql.Driver` (v42.7.2) |

---

## 2. Configuração Externa (`database.yml`)

Ao invocar `setupDatabase(..., configFromYml = true)`, o Core lê as configurações do arquivo `database.yml` na pasta do seu plugin:

```yaml
database:
  # Tipo: H2 | MYSQL | MARIADB | POSTGRES
  type: MYSQL

  # Conexão externa
  host: localhost
  port: 3306
  name: arqenmc
  username: root
  password: "super_secret_password"

  # Pool de conexões (HikariCP)
  pool-size: 10
  connection-timeout: 10000
  validation-timeout: 5000
  ssl: false

  # Prefixo das tabelas
  table-prefix: "arqen_"
```

::: tip Fallback Automático de Emergência (H2)
Se o banco MySQL/Postgres estiver inacessível durante a inicialização (falha de rede, timeout ou credenciais erradas), o Core **NÃO crasheia o servidor**. Ele ativa automaticamente o banco local de emergência H2 (`plugins/<Plugin>/<plugin>.mv.db`), migra o esquema e mantém o plugin online.
:::

---

## 3. Definição de Esquemas (`Table`)

Utilize a DSL do Exposed para declarar suas tabelas e colunas com tipagem estática e segura:

```kotlin
package com.arqenmc.meuplugin.database

import org.jetbrains.exposed.sql.Table

object JogadoresTable : Table("jogadores") {
    val uuid = varchar("uuid", 36)
    val nome = varchar("nome", 16)
    val moedas = double("moedas").default(0.0)
    val nivel = integer("nivel").default(1)
    val ultimoLogin = long("ultimo_login")

    override val primaryKey = PrimaryKey(uuid)
}
```

---

## 4. Inicialização no Ciclo de Vida do Plugin

No método `onStart()` da sua classe que herda de `com.arqenmc.Plugin`:

```kotlin
class MeuPlugin : Plugin() {

    override fun onStart() {
        // Inicializa o pool, conecta e cria as tabelas ausentes automaticamente
        setupDatabase(
            JogadoresTable,
            configFromYml = true
        )
    }
}
```

---

## 5. Execução de Consultas com `suspendQuery`

::: danger Proteção de TPS na Main Thread
Nunca execute operações de banco na Main Thread! O método síncrono `query { ... }` possui uma **guarda ativa** que detecta violações e emite logs de alerta severos.
Utilize sempre **`suspendQuery { ... }`** dentro de uma corrotina assíncrona (`scheduler.async`).
:::

### 5.1 Inserção / Atualização (Upsert)

```kotlin
scheduler.async {
    context.database?.suspendQuery {
        // Se já existe, atualiza; senão, insere
        val existe = JogadoresTable.select { JogadoresTable.uuid eq player.uniqueId.toString() }.count() > 0

        if (existe) {
            JogadoresTable.update({ JogadoresTable.uuid eq player.uniqueId.toString() }) {
                it[nome] = player.name
                it[ultimoLogin] = System.currentTimeMillis()
            }
        } else {
            JogadoresTable.insert {
                it[uuid] = player.uniqueId.toString()
                it[nome] = player.name
                it[moedas] = 100.0
                it[nivel] = 1
                it[ultimoLogin] = System.currentTimeMillis()
            }
        }
    }
}
```

### 5.2 Consulta com Retorno à Main Thread

```kotlin
fun consultarSaldo(player: Player) {
    scheduler.async {
        // Consulta no Dispatchers.IO
        val saldo = context.database?.suspendQuery {
            JogadoresTable
                .slice(JogadoresTable.moedas)
                .select { JogadoresTable.uuid eq player.uniqueId.toString() }
                .singleOrNull()?.get(JogadoresTable.moedas) ?: 0.0
        } ?: 0.0

        // Retorno seguro para notificar o jogador
        scheduler.sync {
            if (player.isOnline) {
                player.message("<gray>Seu saldo atual é: <gold>$$saldo")
            }
        }
    }
}
```
