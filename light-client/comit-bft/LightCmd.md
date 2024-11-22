## LightCmd
Basic Process for start a light client
```mermaid
graph TD
    runProxy --> |db|NewPebbleDB
    NewPebbleDB --> |get|witnessesAddrs
    witnessesAddrs --> |check|compare1{trustedHeight and trustedHash not empty}
    compare1 --> |true|NewHTTPClient
    compare1 --> |false|NewHTTPClientFromTrustedStore
    NewHTTPClient --> NewClient
    NewClient --> trustOptions.ValidateBasic
    trustOptions.ValidateBasic --> NewClientFromTrustedStore
    NewHTTPClientFromTrustedStore --> NewClientFromTrustedStore
    NewClientFromTrustedStore --> check1[c.witnesses != 0]
    check1 --> check2[witnesses.ChainID != chainID]
    check2 --> check3[ValidateTrustLevel]
    check3 --> restoreTrustedLightBlock
    restoreTrustedLightBlock --> light.Client
    light.Client --> lproxy.NewProxy
    lproxy.NewProxy --> ListenAndServe
    ListenAndServe --> |func| p.listen
    p.listen --> |create| RPCRoutes
    RPCRoutes --> RegisterRPCFuncs
    RegisterRPCFuncs --> WebsocketHandler
    WebsocketHandler  --> p.Client.Start
    p.Client.Start --> rpcserver.Listen
```
## Structure
```mermaid
graph TD
    light.proxy.proxy --> |struct|Addr
    light.proxy.proxy --> |struct|Config
    light.proxy.proxy --> |*lrpc.Client|Client1[Client]
    light.proxy.proxy --> |struct|Logger
    light.proxy.proxy --> |struct|Listener

    Client1 --> |struct|light.rpc.client

    light.rpc.client --> |rpcclient.Client|next
    light.rpc.client --> |LightClient|lc
    light.rpc.client --> |struct|prt
    light.rpc.client --> |struct|keyPathFn

    next --> |struct|rpc.client.http.http
    
    lc --> |struct|light.client
```

### light.proxy.proxy
```
type Proxy struct {
	Addr     string // TCP address to listen on, ":http" if empty
	Config   *rpcserver.Config
	Client   *lrpc.Client
	Logger   log.Logger
	Listener net.Listener
}
```

### light.rpc.client
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

### rpc.client.http.http
```
type HTTP struct {
	remote string
	rpc    *jsonrpcclient.Client

	*baseRPCClient
	*WSEvents
}
```

### light.client
```light.client
type Client struct {
	chainID          string
	trustingPeriod   time.Duration // see TrustOptions.Period
	verificationMode mode
	trustLevel       cmtmath.Fraction
	maxRetryAttempts uint16 // see MaxRetryAttempts option
	maxClockDrift    time.Duration
	maxBlockLag      time.Duration

	// Mutex for locking during changes of the light clients providers
	providerMutex cmtsync.Mutex
	// Primary provider of new headers.
	primary provider.Provider
	// Providers used to "witness" new headers.
	witnesses []provider.Provider

	// Where trusted light blocks are stored.
	trustedStore store.Store
	// Highest trusted light block from the store (height=H).
	latestTrustedBlock *types.LightBlock

	// See RemoveNoLongerTrustedHeadersPeriod option
	pruningSize uint16
	// See ConfirmationFunction option
	confirmationFn func(action string) bool

	quit chan struct{}

	lo
```

