## BlockSynchronized
path `graph/src/blockchain/polling_block_stream.rs`

line 215 `async fn get_next_step(&self)`

```mermaid
 graph LR
     A{head_ptr_opt.number - subgraph_ptr.number > reorg_threshold}
     B{subgraph_ptr on main chain}
     C{head_ancestor.parent_hash == subgraph_ptr.hash}

     Revert1[Revert parent]
     Revert2[Revert parent]
    
     ProcessDescendantBlocks1[ProcessDescendantBlocks]
     ProcessDescendantBlocks2[ProcessDescendantBlocks]
     
     A -->|true| B
     B -->|true|sync_multiple_block
     B -->|false| Revert1
     sync_multiple_block --> |return|ProcessDescendantBlocks1
     
     A -->|false| get_next_block
     get_next_block --> C 
     C --> |true| sync_single_block
     C --> |false| Revert2
     sync_single_block --> |return|ProcessDescendantBlocks2
```


### Param explain
`head_ptr_opt` currently the block we got from rpc service.

`subgraph_ptr` block subgraph have synchronized in db.

`reorg_threshold` and important constant we set for block synchronized.

