# RpcBackend

```mermaid
graph LR
    Backend --> |struct| gaspriceOracle
    Backend --> |struct| queryClient
    Backend --> |struct| clientCtx
    Backend --> |struct| ethChainID
    Backend --> |struct| config
    Backend --> |struct| logger

    clientCtx --> |struct| Client
    Client -->|interface|cosmos-sdk.client.comebft
    cosmos-sdk.client.comebft --> |struct| cometbft.light.rpc.client
    
    
    
    main.go --> NewRootCmd
    NewRootCmd --> initRootCmd
    initRootCmd --> AddStartCommands
    AddStartCommands --> StartCmdWithOptions
    StartCmdWithOptions --> |cosmos-sdk|start
    start --> startInProcess
    startInProcess --> startCmtNode
    startCmtNode --> |cometbft| node.NewNode
    node.NewNode --> ccometbft.node.node
```



### cometbft.light.rpc.client
```
type Client struct {
	service.BaseService

	next rpcclient.Client
	lc   LightClient

	// proof runtime used to verify values returned by ABCIQuery
	prt       *merkle.ProofRuntime
	keyPathFn KeyPathFunc
}
```

### ccometbft.node.node
Node is the highest level interface to a full CometBFT node.

It includes all configuration information and running services.
```
type Node struct {
	service.BaseService

	// config
	config        *cfg.Config
	genesisTime   time.Time
	privValidator types.PrivValidator // local node's validator key
    ...
}
```