### StrategyManager
Manage staker and it's corresponding strategy shares.


@notice Mapping: staker => Strategy => number of shares which they currently hold


`mapping(address => mapping(IStrategy => uint256)) public stakerStrategyShares;`


```mermaid
graph TD
    
    deployStrategy --> |function |_depositIntoStrategy
    nonce -->|function | _depositIntoStrategy

    _depositIntoStrategy -->|+= shares| stakerStrategyShares
    depositIntoStrategyWithSignature --> nonce[nonce + 1]
    
    StrategyManager -->|function | depositIntoStrategyWithSignature
    StrategyManager -->|function| deployStrategy
    StrategyManager -->|function| addStrategiesToDepositWhitelist
    StrategyManager -->|function| removeStrategiesFromDepositWhitelist
    
```

### RewardsCoordinator
Contract for reward distribution.
```mermaid
graph TD
    
    createAVSRewardsSubmission --> |modifier onlyWhenNotPaused|PAUSED_AVS_REWARDS_SUBMISSION
    PAUSED_AVS_REWARDS_SUBMISSION --> nonce[nonce + 1]
    nonce[nonce + 1] -->|function | safeTransferFrom

    createRewardsForAllSubmission --> |modifier onlyWhenNotPaused|PAUSED_REWARDS_FOR_ALL_SUBMISSION
    PAUSED_REWARDS_FOR_ALL_SUBMISSION --> |modifier|onlyRewardsForAllSubmitter
    onlyRewardsForAllSubmitter --> nonce[nonce + 1]

    createRewardsForAllEarners --> |modifier onlyWhenNotPaused|PAUSED_REWARDS_FOR_ALL_EARNERS
    PAUSED_REWARDS_FOR_ALL_EARNERS --> |modifier|onlyRewardsForAllSubmitter

    processClaim --> safeTransfer
    
    RewardsCoordinator -->|function | createAVSRewardsSubmission
    RewardsCoordinator -->|function | createRewardsForAllSubmission
    RewardsCoordinator -->|function | createRewardsForAllEarners
    RewardsCoordinator -->|function | processClaim
    
```
### DelegationManager
delegate operator to operate on staker's behalf, with signature and shares.
```mermaid
graph TD
    registerAsOperator -->|function | _delegate
    _delegate -->|function | _increaseOperatorShares


    delegateTo -->|function | _delegate

    delegateToBySignature --> nonce[currentStakerNonce + 1]
    nonce[currentStakerNonce + 1] -->|function | _delegate

    queueWithdrawals -->|function | _decreaseOperatorShares
    _decreaseOperatorShares -->|function | calculateWithdrawalRoot
    
    DelegationManager -->|function | registerAsOperator
    DelegationManager -->|function | delegateTo
    DelegationManager -->|function | delegateToBySignature
    DelegationManager -->|function | queueWithdrawals
```

### AVSDirectory

```mermaid
graph TD
    registerOperatorToAVS -->|mapping avsOperatorStatus| OperatorAVSRegistrationStatus.REGISTERED
    deregisterOperatorFromAVS -->|mapping avsOperatorStatus| OperatorAVSRegistrationStatus.UNREGISTERED


    AVSDirectory -->|function | registerOperatorToAVS
    AVSDirectory -->|function | deregisterOperatorFromAVS
```
