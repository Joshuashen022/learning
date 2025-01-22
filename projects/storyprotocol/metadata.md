# Metadata


Contract `CoreMetadataModule` & Contract `CoreMetadataViewModule`

This contract keeps track of the relation between `ipId` and its metadata. 
The metadata is stored in the `CoreMetadataModule` contract and can be accessed by the `CoreMetadataViewModule` contract.

**This contract is like our `AssetMetadata` contract, but it is more generic and can be used for any type of metadata.**

```mermaid
classDiagram
    class CoreMetadataViewModule {
        +string name
        +address IP_ASSET_REGISTRY
        +address MODULE_REGISTRY
        +address coreMetadataModule
        +constructor(address ipAssetRegistry, address moduleRegistry)
        +updateCoreMetadataModule()
        +getCoreMetadata(address ipId) returns CoreMetadata
        +getMetadataURI(address ipId) returns string
        +getMetadataHash(address ipId) returns bytes32
        +getRegistrationDate(address ipId) returns uint256
        +getNftTokenURI(address ipId) returns string
        +getNftMetadataHash(address ipId) returns bytes32
        +getOwner(address ipId) returns address
        +getJsonString(address ipId) returns string
        +isSupported(address ipAccount) returns bool
        +supportsInterface(bytes4 interfaceId) returns bool
    }

    class BaseModule {
        <<abstract>>
        +supportsInterface(bytes4 interfaceId) returns bool
    }

    class ICoreMetadataViewModule {
        <<interface>>
    }

    class IIPAccount {
        +getString(address module, string key) returns string
        +getBytes32(address module, string key) returns bytes32
        +getUint256(address module, string key) returns uint256
        +owner() returns address
    }

    class IModuleRegistry {
        +getModule(bytes32 key) returns address
    }

    CoreMetadataViewModule --> BaseModule
    CoreMetadataViewModule --> ICoreMetadataViewModule
    CoreMetadataViewModule --> IIPAccount
    CoreMetadataViewModule --> IModuleRegistry
```

This diagram shows the `CoreMetadataViewModule` class and its relationships with other classes and interfaces.


```mermaid
classDiagram
    class CoreMetadataViewModule {
        +string name
        +address IP_ASSET_REGISTRY
        +address MODULE_REGISTRY
        +address coreMetadataModule
        +constructor(address ipAssetRegistry, address moduleRegistry)
        +updateCoreMetadataModule()
        +getCoreMetadata(address ipId) returns CoreMetadata
        +getMetadataURI(address ipId) returns string
        +getMetadataHash(address ipId) returns bytes32
        +getRegistrationDate(address ipId) returns uint256
        +getNftTokenURI(address ipId) returns string
        +getNftMetadataHash(address ipId) returns bytes32
        +getOwner(address ipId) returns address
        +getJsonString(address ipId) returns string
        +isSupported(address ipAccount) returns bool
        +supportsInterface(bytes4 interfaceId) returns bool
    }

    class BaseModule {
        <<abstract>>
        +supportsInterface(bytes4 interfaceId) returns bool
    }

    class ICoreMetadataViewModule {
        <<interface>>
    }

    class IIPAccount {
        +getString(address module, string key) returns string
        +getBytes32(address module, string key) returns bytes32
        +getUint256(address module, string key) returns uint256
        +owner() returns address
    }

    class IModuleRegistry {
        +getModule(bytes32 key) returns address
    }

    CoreMetadataViewModule --> BaseModule
    CoreMetadataViewModule --> ICoreMetadataViewModule
    CoreMetadataViewModule --> IIPAccount
    CoreMetadataViewModule --> IModuleRegistry
```

This diagram shows the CoreMetadataViewModule class and its relationships with other classes and interfaces.