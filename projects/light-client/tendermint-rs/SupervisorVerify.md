## Supervisor Verify
path `light-client/src/supervisor.rs`
```mermaid
graph TD
    light_client -->|function| verify_to_highest
    verify_to_highest --> |function | fetch_light_block
    fetch_light_block --> |get highest| target_height
    target_height --> |function| verify_to_target

    state --> |get| store_highest


    verify_to_target --> |check| compare1{target_height >= store_highest}
    store_highest --> |check| compare1{target_height >= store_highest}
    compare1 --> |true| verify_forward
    compare1 --> |false| verify_backward

    verify_forward --> |check| block_height
    block_height --> |check| is_within_trust_period
    is_within_trust_period --> get_or_fetch_block
    get_or_fetch_block --> current_block
    current_block --> self.verifier.verify
    self.verifier.verify --> verdict

```

### self.verifier.verify
```mermaid
graph TD
    self.verifier.verify --> |verify time|is_within_trust_period2[is_within_trust_period]
    is_within_trust_period2[is_within_trust_period] --> |verify time|is_header_from_past
    is_header_from_past --> |verify hash|validator_sets_match
    validator_sets_match --> |verify hash| next_validators_match
    next_validators_match --> |verify hash| header_matches_commit
    header_matches_commit --> |verify hash | valid_commit
    valid_commit --> no_missing_signature
    no_missing_signature --> signer_in_validator_set
    signer_in_validator_set --> is_monotonic_bft_time
    is_monotonic_bft_time --> |check|compare2{trusted.height + 1 == untrusted.height}
    compare2 --> |true| validator_set_hash_equal
    compare2 --> |false| is_monotonic_height
    is_monotonic_height --> has_sufficient_validators_overlap
    validator_set_hash_equal --> has_sufficient_signers_overlap
    has_sufficient_validators_overlap --> has_sufficient_signers_overlap
    has_sufficient_signers_overlap --> Verdict::Success
```

### has_sufficient_validators_overlap
Check that there is enough validators overlap between the trusted validator set
nd the untrusted signed header.


```mermaid
graph TD
    options.trust_threshold --> trust_threshold
    trust_threshold --> has_sufficient_validators_overlap
    has_sufficient_validators_overlap --> |fn| calculator.check_enough_trust
    calculator.check_enough_trust --> |fn| voting_power_in
    voting_power_in --> |calculate| voting_power
    voting_power --> |check| trust_threshold.is_enough_power
    trust_threshold.is_enough_power --> compare[signed_voting_power * self.denominator > total_voting_power * self.numerator]
    compare --> OK
    
```

### has_sufficient_signers_overlap
Check that there is enough signers overlap between the given, untrusted validator set
and the untrusted signed header.

Verify that more than 2/3 of the validators correctly committed the block
```mermaid
graph TD
    TrustThreshold::TWO_THIRDS --> trust_threshold
    trust_threshold --> has_sufficient_signers_overlap
    has_sufficient_signers_overlap --> |fn| calculator.check_signers_overlap
    calculator.check_signers_overlap --> |fn| voting_power_in
    voting_power_in --> |calculate| voting_power
    voting_power --> |check| trust_threshold.is_enough_power
    trust_threshold.is_enough_power --> compare[signed_voting_power * self.denominator > total_voting_power * self.numerator]
    compare --> OK
    
```