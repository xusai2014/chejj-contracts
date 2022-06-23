## 智能合约

### ERC-20

代币合约跟踪同质化（可替代）代币：任何一个代币都完全等同于任何其他代币；
没有任何代币具有与之相关的特殊权利或行为。这使得 ERC20 代币可用于交换货币、投票权、质押等媒介。

### ERC-721

### EIP-1967
[标准代理存储插槽](https://eips.ethereum.org/EIPS/eip-1967!)
标准化代理存储它们委托的逻辑合约的地址以及其他特定于代理的信息的位置

** 摘要 **

委托代理合约是广泛用于升级和节省gas，这些代理依赖的逻辑合约是通过delegatecall调用。这将允许当代码委托给逻辑合约时，代理持久化状态

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

### openzeppelin
安全的智能合约开发库。它是建立在社区审查通过的代码的坚实基础之上。

#### 代理

- 透明代理：该合约实现了一个可由管理员升级的代理。
- UUPS代理：为 UUPS 代理设计的可升级机制。
