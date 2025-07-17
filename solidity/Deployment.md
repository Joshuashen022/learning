## Hardhat-ignition
https://hardhat.org/hardhat-runner/docs/guides/deploying
## Hardhat-deploy
https://github.com/wighawag/tutorial-hardhat-deploy

 - integrated diamond deploy method
```typescript
  const deployResult = await diamond.deploy("AssetOwnerNFTDiamond", {
    from: deployer,
    excludeSelectors: {
        AssetOwnerNFT: ["supportsInterface"],
    },
    facets: ["AssetOwnerNFT", "AssetOwnerNFTDescriptor", "MulticallFacet"],
    log: true,
});
```

 - integrated proxy deploy method
```typescript
  const deployResult = await deploy("VaultFactory", {
    proxy: {
      execute: {
        methodName: "initialize",
        args: [(await deployments.get("AccessManagerX")).address, vaultImp.address, verifierDeployResult.address],
      },
    },
    from: deployer,
    log: true,
  });
```
## Foundry
https://getfoundry.sh/forge/deploying/