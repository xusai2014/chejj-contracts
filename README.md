## 智能合约


### 硬分叉

- 如果以太坊区块链未来不进行硬分叉，那么网络上的挖矿难度将增加，验证会变得缓慢，网络上的活动可能会接近停顿的程度; 这个问题被称为以太坊难度炸弹或以太坊冰河时代

**定义**

区块链发生永久性分歧，在新共识规则发布后，部分没有升级的节点无法验证已经升级的节点生产的区块，通常硬分叉就会发生。代码出现一个硬分叉，会改变挖矿算法的难度级别。

**抽象定义**

硬分叉是指比特币区块格式或交易格式（这就是广泛流传的“共识”）发生改变时，未升级的节点拒绝验证已经升级的节点生产出的区块，不过已经升级的节点可以验证未升级节点生产出的区块，然后大家各自延续自己认为正确的链，所以分成两条链。


以太坊未来发展方向：Frontier（前沿）、Homestead（家园）、Metropolis（大都会）和Serenity（宁静）四个阶段，“大都会”这个阶段将为以太坊带来大量重要的特性，但受限于开发人员精力，不可能一次性引入那么多特性，因此就通过两个阶段发布，分别是Byzantium（拜占庭） 和Constantinople（君士坦丁堡）

- 第1次分叉：Homestead家园（2016/3/14分叉成功）

    - 原因：以太坊网络系统升级 
    - 目的：第一个稳定版的网络 
    - 升级部分：
      - 1.块难度更改 
      - 2.添加新操作码 
      - 3.一些网络调整

- 第2次分叉：The DAO Hard Fork（2016/7/20分叉完成）
  
    - 原因：黑客攻击The DAO合约漏洞转移以太币 
    - 目的：夺回被盗资金 
    - 升级部分：
      - 1.修改代码，数据回滚到被盗之前的区块高度 
      - 2.分叉出一条全新的主链，不接受改变的矿工则继续在原有链上挖矿，形成ETH\\ETC两条链

- 第3次分叉：EIP150 gas cost hard fork（2016/10/18进行分叉）

  - 原因：网络受到频繁的拒绝服务攻击 
  - 目的：减轻垃圾交易邮件攻击 
  - 升级部分：提高价格过低的操作代码价格

- 第4次分叉：Spurious Dragon hard fork（2016/11/22进行分叉）

  - 原因：网络肿胀拥堵 
  - 目的：加快网络交易速度 
  - 升级部分：清除攻击者制造的以太坊网络空账号

- 第5次分叉：Byzantium Hard Fork 拜占庭硬分叉（2017/10/16进行分叉）

  - 原因：以太坊网络系统升级 
  - 目的：解决隐私性问题 
  - 升级部分：
    - 1.实现匿名交易
    - 2.开发者开发难度减小
    - 3.可预测Gas收费
    - 4.允许ZK-Snarks和其他加密mathemagic
    - 5.钱包安全性提高6.提升挖矿难度7.推迟算力炸弹



### ERC-20

代币合约跟踪同质化（可替代）代币：任何一个代币都完全等同于任何其他代币；
没有任何代币具有与之相关的特殊权利或行为。这使得 ERC20 代币可用于交换货币、投票权、质押等媒介。

### ERC-721

### EIP-1967
[标准代理存储插槽](https://eips.ethereum.org/EIPS/eip-1967!)

标准化代理存储它们委托的逻辑合约的地址以及其他特定于代理的信息的位置

**摘要**

委托代理合约是广泛用于升级和节省gas，这些代理依赖的逻辑合约是通过delegatecall调用。这将允许当代码委托给逻辑合约时，代理持久化状态

### EIP-170: Contract code size limit
[合约代码体积限制](https://eips.ethereum.org/EIPS/eip-170!)


## 开发工具 

### truffle

```shell
npm install truffle -g
truffle init
```
```shell
npx truffle create contract NewsNFT
npx truffle create contract Niu
```

```shell
truffle run compile
truffle run contract-size
truffle migrate --network rinkeby
```

### openzeppelin
安全的智能合约开发库。它是建立在社区审查通过的代码的坚实基础之上。

#### 代理

- 透明代理：该合约实现了一个可由管理员升级的代理。
- UUPS代理：为 UUPS 代理设计的可升级机制。

#### 缩小以太坊合同规模，以应对合同体积限制
```markdown

Warning: Contract code size is 30823 bytes and exceeds 24576 bytes (a limit introduced in Spurious Dragon). This contract may not be deployable on mainnet. Consider enabling the optimizer (with a low "runs" value!), turning off revert strings, or using libraries.

Warning: Contract code size is 29902 bytes and exceeds 24576 bytes (a limit introduced in Spurious Dragon). This contract may not be deployable on mainnet. Consider enabling the optimizer (with a low "runs" value!), turning off revert strings, or using libraries.

```

```shell
npm install truffle-contract-size

# truffle run contract-size在truffle-config.js文件中加入

plugins: ["truffle-contract-size"]

truffle run contract-size
```


## 合约版本

0.0.1
NewsNFT: 0xdA4477C00e2a191001c28f0076F7640443bC57E8
NiuToken: 0xBee99CC72dfAbD7f67924B2FDDcE52C919A86B47
NewsChampion: 0x9De27e72662ac99e6bFB096f1F9644f0d6B50705
