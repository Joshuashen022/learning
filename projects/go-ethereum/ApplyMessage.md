
### core.ApplyMessage
`go-ethereum`
https://github.com/ethereum/go-ethereum


path `core./state_transition.go`
line 183
```mermaid
graph TD
    ApplyMessage --> NewStateTransition
    NewStateTransition --> |st *StateTransition|TransitionDb
    TransitionDb --> preCheck(preCheck)
    preCheck -->|check|check1{valid nonce}
    check1 --> |check|check2{not EOA}
    check2 -->|check|check3{gas check}
    check3 --> |check|check4{BlobHashes valid}
    check4 -->|check|check5{BlobGasFeeCap valid}
    check5 --> buyGas(buyGas)
    buyGas -->check6{account balance > gas needed}
    check6 --> |state.SubBalance| deductGas
    deductGas --> |calculate| IntrinsicGas
    IntrinsicGas --> gasNeeded
    gasNeeded --> check7{gasNeeded < gasLimit}
    check7 --> calculate1[gasRemaining = gasLimit - gasNeeded]
    calculate1 --> EIP4762
    EIP4762 --> |check| check8{CanTransfer}
    check8 -->|check| check9{IsShanghai MaxInitCodeSize}
    check9 --> if{contractCreation}
    if --> |true| st.evm.Create
    if --> |false| st.evm.Call


```

### evm.Create
``` mermaid
graph TD

  st.evm.Create --> |crypto.CreateAddress| contractAddr
  contractAddr --> evm.create
  evm.create --> evm.StateDB.SetNonce
  evm.StateDB.SetNonce --> check10{not exist contractAddr}
  check10 --> evm.StateDB.CreateAccount
  evm.StateDB.CreateAccount --> evm.StateDB.CreateContract
  evm.StateDB.CreateContract --> |contractAddr.nonce=1|SetNonce
  SetNonce --> |value contractAddr|Transfer
  Transfer --> contract.SetCodeOptionalHash
  contract.SetCodeOptionalHash --> evm.interpreter.Run
  evm.interpreter.Run --> |run| ret
  ret --> evm.StateDB.SetCode

```
### evm.call
```mermaid
graph TD
  sender --> st.evm.Call
  st.to --> st.evm.Call
  msg.Data --> st.evm.Call
  st.gasRemaining --> st.evm.Call
  msg.Value --> st.evm.Call
  
  
  st.evm.Call --> check11{exist toAddr}
  check11 --> |false| AddAccount2[evm.AccessEvents.AddAccount]
  AddAccount2 --> CreateAccount2[evm.StateDB.CreateAccount]
  CreateAccount2 --> Transfer2[evm.Context.Transfer]
  check11 --> |true| Transfer2
  Transfer2 --> isPrecompile{isPrecompile}
  isPrecompile -->|true|RunPrecompiledContract
  isPrecompile -->|false|evm.StateDB.GetCode
  evm.StateDB.GetCode --> code
  code --> |NewContract| contract
  contract --> evm.interpreter.Run
  evm.interpreter.Run --> |run| err
  err --> |not nil| evm.StateDB.RevertToSnapshot
  err --> |nil| return
```
### evm.interpreter.Run
```mermaid
graph TD
  contract --> evm.interpreter.Run
  input --> evm.interpreter.Run
  readOnly --> evm.interpreter.Run
  evm.interpreter.Run --> |run| in.evm.depth++
  in.evm.depth++ --> |run| pc1[pc == 1]
  pc1 --> |contract.GetOp| op
  op --> |in.table|operation
```

### Containing Information
```
type Message struct {
	To            *common.Address
	From          common.Address
	Nonce         uint64
	Value         *big.Int
	GasLimit      uint64
	GasPrice      *big.Int
	GasFeeCap     *big.Int
	GasTipCap     *big.Int
	Data          []byte
	AccessList    types.AccessList
	BlobGasFeeCap *big.Int
	BlobHashes    []common.Hash

	// When SkipAccountChecks is true, the message nonce is not checked against the
	// account nonce in state. It also disables checking that the sender is an EOA.
	// This field will be set to true for operations like RPC eth_call.
	SkipAccountChecks bool
}
```
**EVM Version**
https://docs.blockscout.com/setup/information-and-settings/evm-version-information

**Accounts types**
- Externally Owned Accounts (EOA)
- Smart Contract Accounts (SCA)


GasPrice: This is the price you're willing to pay per unit of gas for executing a transaction or smart contract on the Ethereum network. It's usually denoted in Gwei (1 Gwei = 10^-9 ETH).

GasFeeCap: This is the maximum amount of gas fees you're willing to pay for a transaction. If the calculated gas fee exceeds this cap, the transaction will not be processed.

GasTipCap: This is the maximum amount of tips you're willing to pay to miners for including your transaction in a block. It's a way to incentivize miners to prioritize your transaction.

Value: The Value field represents the amount of Ether (ETH) that is being transferred from the sender to the recipient in the transaction.


**Components of Intrinsic Gas:**

Base Transaction Cost: Every transaction has a base cost of 21,000 gas units. This covers the basic cost of sending a transaction.

Cost of Transaction Data: Each byte of data in the transaction also adds to the intrinsic gas cost. Specifically:

68 gas per non-zero byte of data.

4 gas per zero byte of data.

**EIP4762**

New Gas Costs for Witness Creation:
The proposal introduces specific gas costs for creating
and updating witnesses, which are necessary for stateless clients


**The Merge**

https://ethereum.org/en/roadmap/merge/

Ethereum Mainnet uses proof-of-stake, but this wasn't always the case.
The upgrade from the original proof-of-work mechanism to proof-of-stake was called The Merge.
The Merge refers to the original Ethereum Mainnet merging with a separate proof-of-stake blockchain called the Beacon Chain, now existing as one chain.
The Merge reduced Ethereum's energy consumption by ~99.95%.

**Shanghai Upgrade**
The Shanghai upgrade, also known as the Shanghai/Capella fork,
primarily focuses on enabling the withdrawal of staked Ether (ETH)
and staking rewards. However, it also includes several Ethereum
Improvement Proposals (EIPs) that impact contract creation and
overall network efficiency1.
Key EIPs Related to Contract Creation:

- EIP-3860
  https://eips.ethereum.org/EIPS/eip-3860
  Limit the maximum size of initcode to 49152 and apply extra gas cost of 2 for every 32-byte chunk of initcode.


**Access List Prepare**
- EIP2929: Increased Gas Costs for Certain Operations, so related address need to be record
  later can increase gas fee for that related operations.
- Access List
  The access list is a mechanism used in Ethereum's transaction processing to optimize the execution of transactions
  by providing a list of addresses that the transaction may interact with.

Berlin fork:
- Add sender to access list (2929)
- Add destination to access list (2929)
- Add precompiles to access list (2929)
- Add the contents of the optional tx access list (2930)

Potential EIPs:
- Reset access list (Berlin)
- Add coinbase to access list (EIP-3651)
- Reset transient storage (EIP-1153)


### Gas Calculation
func IntrinsicGas

path `core/state_transition.go`

```mermaid
graph TD
    
    case1[isContractCreation & Homestead] --> 53000
    case2[tx execution] --> 21000
    53000 -->initialGas
    21000 -->initialGas
    data -->|non-zero bytes len|nz
    data --> |len| dataLen
    case3[isEIP2028] --> 16
    case4[Frontier] --> 68
    16 --> nonZeroGas
    68 --> nonZeroGas

    accessList --> |len| lenAccessList
    accessList -->|StorageKeys|sumStorageKeys
    
    nz -->calculate1
    nonZeroGas -->calculate1
    initialGas -->calculate1
    calculate1[nz * nonZeroGas + initialGas] --> check1
    check1{ overflow?} 
    check1 --> |=|gas

    dataLen -->|toWords|lenWords

    gas --> calculate2
    lenWords --> calculate2
    calculate2[lenWords * 2 + gas]
    calculate2 --> check2{overflow?}
    check2 --> |=|gas2[gas]
    
    calculate3[lenAccessList * 2400 + gas]
    gas2 --> calculate3
    lenAccessList --> calculate3
    calculate3 --> |=|gas3[gas]
    
    calculate4[sumStorageKeys * 1900 + gas]
    gas3 --> calculate4
    sumStorageKeys --> calculate4
    calculate4 --> |=|gas4[gas]
```

### EIP4762
(Unclear)
New Gas Costs for Witness Creation:
The proposal introduces specific gas costs for creating
and updating witnesses, which are necessary for stateless clients

### EIP-158
EIP-158 是以太坊改进提案（Ethereum Improvement Proposal）之一，它在以太坊网络的 “Spurious Dragon” 硬分叉 中被引入，主要目的是改进以太坊状态树的存储效率，并清理不必要的状态数据。Spurious Dragon 硬分叉发生在 2016 年 11 月 22 日，区块高度为 2,675,000。

EIP-158 的核心目标是通过清理冗余状态和优化状态管理，减少以太坊状态树的膨胀，提升网络的性能和可扩展性。

### EIP-3541
EIP-3541 的核心目的是为未来的 EVM 改进（例如新的合约代码格式）预留空间。
它通过 拒绝以 0xEF 开头的合约代码，确保这个前缀不会被滥用。
这段注释的含义是：在 EIP-3541 启用后，任何以 0xEF 开头的新合约代码都会被拒绝。
此提案已在 London 硬分叉 中激活，是以太坊网络协议的一部分。

### EIP-4762
EIP-4762 是一个以太坊改进提案（Ethereum Improvement Proposal），其核心目的是 永久禁止创建 SELFDESTRUCT 操作码的合约。这个提案旨在进一步限制和逐步淘汰以太坊虚拟机（EVM）中的 SELFDESTRUCT 操作码，以解决其在实际使用中带来的问题，并为未来的以太坊升级（如状态清理和合约生命周期管理）铺平道路。