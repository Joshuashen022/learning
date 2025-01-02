# Safe

```mermaid
graph LR
    Safe --> |function|setup
    setup --> |contract|OwnerManager
    OwnerManager --> |function|setupOwners
    
    Safe --> |function|execTransaction
    execTransaction --> |function|encodeTransactionData
    encodeTransactionData --> |function|checkSignatures
    checkSignatures --> |function|checkNSignatures
    checkNSignatures --> |function|signatureSplit
```