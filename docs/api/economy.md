# Integração de Economia Vault — ArqenCore

O ArqenCore integra-se de forma transparente com a API do **Vault**, fornecendo abstrações para transações de saldo e manipulação de moeda no servidor.

---

## 1. Operações de Economia no Jogador

Através do arquivo de extensões `com.arqenmc.extension.ExEconomy`, objetos `Player` e `OfflinePlayer` recebem métodos de acesso direto:

```kotlin
// Cobrança de valor
val resultado = player.charge(150.0)
if (resultado.isSuccess) {
    player.sendMessage("Compra realizada!")
} else {
    player.sendMessage("Saldo insuficiente.")
}

// Depósito de valor
player.deposit(50.0)

// Consulta de saldo
val saldo = player.balance()
val possuiSaldo = player.hasBalance(100.0)

// Definição absoluta de saldo
player.setBalance(500.0)
```

---

## 2. Contrato do `VaultEconomyProvider`

O provedor implementa `net.milkbowl.vault.economy.Economy`:

* **`setBalance` idempotente:** Caso o saldo a ser definido seja igual ao saldo atual do jogador, a operação retorna sucesso imediato sem realizar transações redundantes.
* **Validações numéricas:** Operações com quantias negativas ou nulas são rejeitadas de acordo com o contrato da API Vault.
* **Desregistro no desligamento:** O `EconomyManager` cancela o listener de serviços do Bukkit durante o encerramento do plugin (`shutdown()`), evitando vazamento de referências e registros duplicados após reloads.
