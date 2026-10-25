# Manipulação de Mundos e Schematics (FAWE)

O componente `WorldManager` (`com.arqenmc.world.WorldManager`) centraliza operações espaciais de alto volume utilizando o motor do **FastAsyncWorldEdit (FAWE `2.9.2`)**.

---

## 1. Pré-Requisitos de Infraestrutura

- O plugin **FastAsyncWorldEdit** deve estar instalado no servidor.
- No `plugin.yml` do seu plugin, declare soft-dependência caso utilize os recursos do WorldManager:
  ```yaml
  softdepend: [FastAsyncWorldEdit]
  ```

::: danger Regra de Ouro: Execução Sempre Assíncrona
Operações com FAWE realizam I/O em disco e processamento de milhares de blocos. **Nunca execute métodos de volume do `WorldManager` na Main Thread**. O Core possui guardas ativas que emitirão alertas severos no console caso uma chamada seja feita fora de `scheduler.async { ... }`.
:::

---

## 2. Colagem de Schematics (`.schem`)

O ArqenCore adota o formato moderno de schematics do Sponge (`.schem`):

```kotlin
fun colarArena(spawnLocation: Location) {
    val arquivoSchematic = File(context.dataFolder, "schematics/arena.schem")

    // Operação assíncrona mandatória
    scheduler.async {
        WorldManager.pasteSchematic(
            file = arquivoSchematic,
            origin = spawnLocation,
            ignoreAir = true // Ignora blocos de ar para não sobrescrever o relevo
        )

        // Retorno para a Main Thread para notificar os jogadores
        scheduler.sync {
            Context.server.broadcastMessage(
                Context.colorizeToString("<green>A arena foi colada com sucesso no mundo!")
            )
        }
    }
}
```

---

## 3. Salvamento de Regiões como Schematic

Você pode capturar qualquer volume definido por `WorldRegion` e exportá-lo diretamente para um arquivo `.schem`:

```kotlin
fun salvarCopia(pontoA: Location, pontoB: Location) {
    val regiao = WorldRegion(pontoA, pontoB)
    val arquivoDestino = File(context.dataFolder, "backups/area_protegida.schem")

    scheduler.async {
        WorldManager.saveSchematic(regiao, arquivoDestino)
        
        scheduler.sync {
            player.message("<green>Schematic salvo com sucesso em <yellow>${arquivoDestino.name}<green>!")
        }
    }
}
```

---

## 4. Preenchimento e Substituição de Blocos (`Fill` & `Replace`)

### 4.1 Preencher Região (`fill`)
Preenche instantaneamente uma região cubóide com um material:

```kotlin
scheduler.async {
    val regiao = WorldRegion(loc1, loc2)
    WorldManager.fill(regiao, Material.AIR)
}
```

### 4.2 Substituir Blocos (`replace`)
Substitui um tipo de bloco por outro sem afetar os demais:

```kotlin
scheduler.async {
    val regiao = WorldRegion(loc1, loc2)
    WorldManager.replace(regiao, Material.DIRT, Material.GRASS_BLOCK)
}
```

---

## 5. Gerenciamento de Entidades Travadas (`Locked Entities`)

O `WorldManager` inclui utilitários para criar NPCs estáticos ou entidades decorativas totalmente imóveis, sem inteligência artificial (AI), sem gravidade e imunes a dano:

```kotlin
// Spawna um Villager decorativo totalmente travado
val npc = WorldManager.spawnLocked(EntityType.VILLAGER, npcLocation)

// Verifica se uma entidade está sob proteção de lock
val protegido = WorldManager.isLocked(npc)

// Destrava a entidade (retorna AI e gravidade)
WorldManager.unlock(npc)

// Remove apenas entidades travadas de uma determinada região
WorldManager.removeLockedEntities(regiao)
```
