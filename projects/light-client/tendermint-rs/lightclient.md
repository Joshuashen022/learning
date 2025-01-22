
## Example
This shows how to use light client sdk.
```mermaid
graph TD
    primary_addr -->|make_instance| primary_instance
    witness_addr --> |make_instance| witness_instance
    primary_instance --> Supervisor
    witness_instance --> Supervisor
    Supervisor --> |function| handle
    Supervisor --> |function| run
    handle --> |function| verify_to_highest
    run --> |loop1| run
    verify_to_highest --> |loop2| verify_to_highest

 

    subgraph make instance
        trusted_height -->|fn fetch_light_block| LightBlock
        LightBlock -->|hash| header_hash
        header_hash -->| == |trusted_hash
        trusted_hash --> |store| trust_light_block
        trust_light_block --> |build|Instance
        
    end
        
    primary_addr --> trusted_height
    Instance --> primary_instance

    witness_addr --> trusted_height
    Instance --> witness_instance
    



```
### Loop1
```mermaid
graph TD
    verify_to_highest --> |function| verify
    verify --> LightBlockSender
    LightBlockSender -->|make_event| event[HandleInput::VerifyToHighest]
    event -->|sent by| Supervisor.sender
    Supervisor.sender --> |send| sender1[Generated sender]
    Supervisor.sender --> |thread| run
    sender1[Generated sender] --> |receive| receiver[Generated receiver]
    receiver --> verify_to_highest
    

```
### Loop2
```mermaid
graph TD
    run --> |received by|Supervisor.receiver
    Supervisor.receiver --> |match| HandleInput::VerifyToTarget
    HandleInput::VerifyToTarget --> |function| verify_to_highest2[verify_to_highest]
    verify_to_highest2[verify_to_highest] --> |send|receiver[Generated receiver]
    verify_to_highest2 --> |loop| Supervisor.receiver
```


### LightBlock
Contains block information for light client.
```rust
pub struct LightBlock {
    /// Header and commit of this block
    pub signed_header: SignedHeader,
    /// Validator set at the block height
    #[serde(rename = "validator_set")]
    pub validators: ValidatorSet,
    /// Validator set at the next block height
    #[serde(rename = "next_validator_set")]
    pub next_validators: ValidatorSet,
    /// The peer ID of the node that provided this block
    pub provider: PeerId,
}
```

