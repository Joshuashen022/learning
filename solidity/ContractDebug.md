# Using Foundry to Analyze Transaction Execution

Foundry provides powerful tools for analyzing Ethereum transaction execution. Here's how to use Foundry's capabilities to examine transaction details, gas usage, and execution traces.

## 1. Basic Transaction Analysis

### View Transaction Details
```bash
cast tx <TX_HASH> --rpc-url $RPC_URL
```

This shows basic transaction information including:
- Block number
- From/To addresses
- Gas used
- Input data

### Get Transaction Receipt
```bash
cast receipt <TX_HASH> --rpc-url $RPC_URL
```

Shows additional details like:
- Transaction status (success/failure)
- Gas used
- Logs (events emitted)
- Effective gas price

## 2. Gas Analysis

### Estimate Gas Usage Before Sending
```bash
cast estimate --rpc-url $RPC_URL <TO_ADDRESS> "<FUNCTION_SIGNATURE>" <ARGS>
```

Example:
```bash
cast estimate --rpc-url $RPC_URL 0xContractAddress "transfer(address,uint256)" 0xRecipientAddress 100
```

### Analyze Gas Usage of Existing Transaction
```bash
cast gas <TX_HASH> --rpc-url $RPC_URL
```

## 3. Execution Tracing

### Get Full Trace
```bash
cast run --trace-printer <TX_HASH> --rpc-url $RPC_URL  
```

This provides a complete execution trace showing:
- All contract calls
- Depth of each call
- Gas used at each step
- Opcodes executed

### Get Simplified Call Trace
```bash
cast run <TX_HASH> --rpc-url $RPC_URL --debug
```

Shows a cleaner call hierarchy without opcode-level details.

### Get State Diffs
```bash
cast run <TX_HASH> --rpc-url $RPC_URL --state-diff
```

Shows all storage changes made by the transaction.

## 4. Advanced Analysis

### Simulate Transaction with Different Parameters
```bash
cast rpc eth_call --rpc-url $RPC_URL '{
    "from": "0xSENDER",
    "to": "0xCONTRACT",
    "data": "0xCALLDATA",
    "gas": "0xGAS_LIMIT",
    "gasPrice": "0xGAS_PRICE",
    "value": "0xVALUE"
}'
```

### Debug Specific Function Call
```bash
cast debug <TX_HASH> --rpc-url $RPC_URL
```

This launches an interactive debugger where you can:
- Step through execution
- Inspect stack/memory/storage
- Set breakpoints

## 5. Analyzing Failed Transactions

### Get Revert Reason
```bash
cast receipt <TX_HASH> --rpc-url $RPC_URL | jq .revertReason
```

Or for more detailed analysis:
```bash
cast run <TX_HASH> --rpc-url $RPC_URL --debug
```

## 6. Comparing Transactions

### Compare Gas Usage
```bash
cast gas <TX_HASH_1> <TX_HASH_2> --rpc-url $RPC_URL
```

### Compare State Changes
```bash
cast run <TX_HASH_1> --rpc-url $RPC_URL --state-diff > state1.txt
cast run <TX_HASH_2> --rpc-url $RPC_URL --state-diff > state2.txt
diff state1.txt state2.txt
```

## 7. Visualizing Transaction Flow

For complex transactions, generate a visualization:

```bash
cast run <TX_HASH> --rpc-url $RPC_URL --trace | forge-trace-parser
```

(Requires installing a trace parser tool)

## Tips for Effective Analysis

1. **Use JSON output** for programmatic analysis:
   ```bash
   cast receipt <TX_HASH> --rpc-url $RPC_URL --json
   ```

2. **Filter logs** for specific events:
   ```bash
   cast receipt <TX_HASH> --rpc-url $RPC_URL | jq '.logs[] | select(.topics[0] == "0xEVENT_TOPIC")'
   ```

3. **Compare against local simulation**:
   ```bash
   forge test --fork-url $RPC_URL --fork-block-number <BLOCK> --debug <TEST_NAME>
   ```

Foundry's transaction analysis tools give you deep insight into contract execution, helping with debugging, optimization, and security analysis.


## forge test debug

forge test ./foundry-test/debug/Debug.t.sol -vvv

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../src/core/token-bond-account/TBARegistry.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "forge-std/Test.sol";


contract TxDebug is Test {

    function setUp() public {
    }

    function test_CreateAccount() public {
        uint256 fork = vm.createFork("https://rpc2.saharaa.info", 4778352);
        vm.selectFork(fork);
        bytes32 tx = 0xe167ab78de36a9f1bfa95f4af35201aabc22bd4467ac2916d8af071e1a3de30d;
        vm.transact(tx);
    }
}
```