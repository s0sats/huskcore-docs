# Diagnóstico, Telemetria & Licenciamento

O **ArqenCore v1.2.5** disponibiliza comandos administrativos avançados para monitoramento em tempo real da saúde da JVM, estado das conexões do banco de dados e controle de licenciamento do ecossistema.

---

## 1. Permissão Geral de Administração

Todos os comandos de diagnóstico e gerenciamento do Core exigem a permissão:

```yaml
arqenmc.admin
```

---

## 2. Telemetria ao Vivo (`/arqen stats`)

Exibe em tempo real as métricas vitais da JVM, pool HikariCP e TPS do servidor.

```bash
/arqen stats
```

### Exemplo de Saída no Chat:

```
────────── ArqenCore Telemetria ──────────
 Pool HikariCP: 2 ativas | 3 ociosas | 5 total
 Coroutine Jobs Ativas: 4
 Memória JVM (Heap): 512MB / 2048MB (Livre: 1536MB, Max: 4096MB)
 Desempenho: TPS: 20.00 | MSPT Estimado: < 50.0ms
──────────────────────────────────────────
```

### Indicadores Monitorados:
- **Pool HikariCP:** Conexões atualmente em uso por queries, conexões ociosas prontas no pool e limite total configurado.
- **Coroutine Jobs Ativas:** Quantidade de corrotinas concorrentes sendo executadas pelo `Scheduler` no momento.
- **Memória JVM (Heap):** Memória alocada, consumida e disponível no heap da máquina Java.
- **TPS & MSPT:** Avaliação em tempo real com indicador visual colorido (verde $\ge 19.5$, amarelo $\ge 16.0$, vermelho $< 16.0$) e MSPT médio por tick.

---

## 3. Gestão e Auditoria de Licenças (`/arqen licenca` ou `/arqen license`)

### 3.1 Painel Geral de Licenciamento

Ao executar o comando sem argumentos, o ArqenCore exibe o status de todos os plugins satélites registrados na rede:

```bash
/arqen license
# ou
/arqen licenca
```

### Exemplo de Visualização:

```
────────── ArqenCore Licenciamento ──────────
 Status Geral: VÁLIDA
 Versão ArqenCore: 1.2.5
 Fingerprint da Máquina: 3a7b9c...f4
 Plugins Satélites do Ecossistema:
  • ArqenCrypto v1.0.0 | ✔ Autorizado (Ativo)
  • ArqenClans v1.2.0 | ✔ Autorizado (Ativo)
 Para ativar uma chave: /arqen license <plugin> <chave>
──────────────────────────────────────────────
```

### 3.2 Ativação de Chave para um Plugin Satélite

Para ativar um novo plugin licenciado no servidor:

```bash
/arqen license <plugin> ARQEN-XXXX-XXXX-XXXX-XXXX
```

O Core autentica a chave de forma assíncrona com a API central do ArqenMC, gera o arquivo de cache criptografado com o fingerprint da máquina e inicializa o plugin automaticamente sem necessidade de reiniciar o servidor.

---

## 4. Outros Comandos Administrativos

| Comando | Descrição |
| :--- | :--- |
| **`/arqen list`** | Lista todos os plugins do ecossistema ArqenMC ativos e inativos |
| **`/arqen status [plugin]`** | Exibe a chave parcial e o estado da licença de um plugin específico |
| **`/arqen info`** | Exibe a versão de compilação, commit Git e endpoint da API do Core |
