import { ethers, network, run } from "hardhat";
import { BaseContract } from "ethers";
import fs from "fs";
import path from "path";

/*
 * deploy 批量部署合约(额外扩充属性:address)，参数: 合约名 || [合约名，构造参数列表]
 * 假设 Test.sol 的构造函数无参，Test1.sol 的构造函数参数为: uint256,uint256
 * 例子1: 单部署 Test.sol : batchDeploy("Test")
 * 例子2: 单部署 Test1.sol: batchDeploy(["Test1", [60, 0]])
 * 例子3: 批量部署 Test.sol + Test1.sol: batchDeploy("Test", ["Test1", [60, 0]])
 * */
export async function deploy(
  isVerify: boolean,
  ...names: (string | [string, any[]])[]
): Promise<(BaseContract & { address: string })[]> {
  const instances = await _deploy(...names);
  if (isVerify) {
    if (network.name !== "hardhat") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("verify......");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      for (let i = 0; i < names.length; i++) {
        const info = names[i];
        if (typeof info === "string") {
          await verify(info, instances[i].address);
        } else {
          if (info.length != 2 || info[1] == undefined) {
            continue;
          }
          await verify(info[0], instances[i].address, ...info[1]);
        }
      }
    } else {
      console.warn("[hardhat] verify ignored");
    }
  }
  return instances;
}

type ContractWithAddress = BaseContract & { address: string };

/**
 * `_deploy` 函数在 TypeScript 中异步部署一个或多个合约，并返回一个包含它们地址的合约实例数组。
 * @param {(string | [string, any[]])[]} names - `_deploy` 函数中的 `names` 参数是一个剩余参数，接受可变数量的参数。
 * 每个参数可以是一个字符串，表示要部署的合约的名称，或者是一个包含合约名称和要传递给合约构造函数的参数数组。
 * @returns `_deploy` 函数返回一个 Promise，该 Promise 解析为一个对象数组。数组中的每个对象都是一个合约实例，
 * 其中包含一个 `address` 属性，指示合约的部署地址。
 */
async function _deploy(...names: (string | [string, any[]])[]): Promise<ContractWithAddress[]> {
  const accounts = await ethers.getSigners();
  console.log(`${"Deployer".padStart(20, "=")}  ${accounts[0].address} ${("[" + network.name + "]").padEnd(20, "=")}`);
  const instances: (BaseContract & { address: string })[] = [];
  for (const info of names) {
    let name: string;
    if (typeof info === "string") {
      const Instance = await ethers.getContractFactory(info);
      const tx = await Instance.deploy();
      const contract = await tx.waitForDeployment();
      const myContract = contract as ContractWithAddress;
      myContract.address = await contract.getAddress();
      name = info;
      instances.push(myContract);
      console.log(
        `${info.padStart(20)}: ${myContract.address} [DeployedHash: ${contract.deploymentTransaction()?.hash}]`,
      );
    } else {
      const Instance = await ethers.getContractFactory(info[0]);
      if (info.length != 2 || info[1] == undefined) {
        console.log(`ERROR params: name = ${info[0]}, args = ${info[1]}`);
        // @ts-expect-error sdfsdfsdfsdf
        return;
      }
      const tx = await Instance.deploy(...info[1]);
      const contract = await tx.waitForDeployment();
      const myContract = contract as ContractWithAddress;
      myContract.address = await contract.getAddress();
      name = info[0];
      instances.push(myContract);
      console.log(
        `${info[0].padStart(20)}: ${myContract.address} [DeployedHash: ${contract.deploymentTransaction()?.hash}]`,
      );
    }
  }

  if (names.length != instances.length) {
    console.error("Error exist");
    process.exit(1);
  }
  return instances;
}

// https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-verify
export async function verify(name: string, address: string, ...args: any) {
  await run("verify:verify", {
    contract: `${parseVerifyPath(name)}:${name}`,
    address: address,
    constructorArguments: args ?? [],
  });
}

/**
 * 查找contract文件的路径。
 * 如果找不到，它会输出错误信息并退出程序。
 * 给上传到etherscan的合约文件路径使用.
 * @param filename
 * @param rootDir
 * @returns contract文件路径
 */
function parseVerifyPath(filename: string, rootDir?: string): string {
  // 如果未提供根目录，则默认使用当前文件所在目录
  let rootDirectory = rootDir ?? _getDefaultRootDirectory();

  // 循环查找包含指定文件和contracts目录的项目根目录
  rootDirectory = _findProjectRoot(rootDirectory);

  // 如果文件名不以".sol"结尾，则添加该后缀
  filename = _ensureSolExtension(filename);

  // 查找目标文件路径
  const targetFile = _findTargetFile(filename, rootDirectory);

  // 如果未找到目标文件，则输出错误信息并退出程序
  _handleNotFoundError(targetFile, filename);

  // 将目标文件路径中的根目录替换为"contracts"并将路径中的反斜杠替换为斜杠，返回最终结果
  return _formatFilePath(targetFile, rootDirectory);
}

// 获取默认的根目录
function _getDefaultRootDirectory(): string {
  return __dirname;
}

// 查找项目根目录
function _findProjectRoot(rootDirectory: string): string {
  while (true) {
    const files = fs.readdirSync(rootDirectory);
    if (files.includes("package.json") && files.includes("contracts")) {
      rootDirectory = path.join(rootDirectory, files[files.indexOf("contracts")]);
      break;
    }
    const newRootDirectory = path.join(rootDirectory, "../");
    if (rootDirectory === newRootDirectory) {
      console.error(`Error: Can't find any contract project: from=${rootDirectory} to=${__dirname}`);
      process.exit(1);
    }
    rootDirectory = newRootDirectory;
  }
  return rootDirectory;
}

// 确保文件名以".sol"结尾
function _ensureSolExtension(filename: string): string {
  if (!filename.endsWith(".sol")) {
    filename = filename.trim() + ".sol";
  }
  return filename;
}

// 查找目标文件
function _findTargetFile(filename: string, rootDirectory: string): string {
  let targetFile = "";
  const findFile = (rootDirectory: string) => {
    const files = fs.readdirSync(rootDirectory);
    for (const file of files) {
      const filePath = path.join(rootDirectory, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        if (targetFile) return;
        findFile(filePath);
      } else if (stats.isFile()) {
        if (file === filename) {
          targetFile = filePath;
          return;
        }
      }
    }
  };
  findFile(rootDirectory);
  return targetFile;
}

// 处理未找到文件的情况
function _handleNotFoundError(targetFile: string, filename: string): void {
  if (!targetFile) {
    console.error(`Error: Can't find file: ${filename}`);
    process.exit(1);
  }
}

// 格式化文件路径
function _formatFilePath(targetFile: string, rootDirectory: string): string {
  return targetFile.replace(rootDirectory, "contracts").replace(/\\/g, "/");
}
