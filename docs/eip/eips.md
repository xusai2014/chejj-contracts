# 以太坊改进提案(EIPs)


## [EIP-1967:标准代理存储插槽](https://eips.ethereum.org/EIPS/eip-1967!)

### 概要

标准化代理层存储与委托逻辑合约地址映射，以及其它特定代理层信息

### 目录

- <a hef='#001'>摘要</a>
- 动机
- 规范
  - 逻辑合约地址
  - 信标合约地址
  - 管理员地址
- 基本原理
- 参考实现
- 注意事项
- 版权

<h3 id="001">
摘要
</h3>

委托代理合约广泛用于升级和节约gas。这些代理层依赖逻辑合约（也称作实现合约或者主备），逻辑合约通过delegatecall调用。这允许代理在将代码委托给逻辑契约时保持持久状态（存储和平衡）。

为避免逻辑合约和代理合约在存储应用中出行碰撞，逻辑合约地址通常保存在特定存储槽中(例如OpenZeppelin合约中0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc)保证编译器永远不会分配。EIP提出了一套标准的插槽来存储代理信息。这允许像块探索器这样的客户端正确地提取这些信息并显示给最终用户，并且逻辑合约选择地对其进行操作。

<h3 id="001">
动机
</h3>

委托代理被广泛使用，作为支持升级和降低部署的gas成本的一种手段。
这些代理的例子可以在OpenZeppelin Contracts, Gnosis, AragonOS, Melonport, Limechain, WindingTree, Decentraland和许多其他合同中找到。
但是，由于缺乏用于获取代理的逻辑地址的通用接口，因此不可能构建基于此信息的通用工具。
一个典型的例子是块资源管理器。在这里，最终用户希望与底层逻辑契约进行交互，而不是与代理本身进行交互。
使用从代理检索逻辑合同地址的通用方法，允许块资源管理器显示逻辑合同的ABI，而不是代理的ABI。
浏览器检查契约在区分槽处的存储，以确定它是否确实是代理，在这种情况下，它同时显示代理和逻辑契约的信息。
例如，在以太扫描上显示0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48的方式：

<img src="./img/e.png">

另一个例子是逻辑合约，它们明确地作用于它们被代理的事实。这允许它们可能地触发代码更新，作为其逻辑的一部分。
一个公共存储插槽允许这些用例独立于所使用的特定代理实现。

<h3 id="001">
规范
</h3>

代理监控对于许多应用程序的安全性至关重要。因此，必须能够跟踪对实施和管理槽的更改。不幸的是，跟踪存储槽的变化并不容易。
因此，建议任何改变这些槽的函数也应该发出相应的事件。这包括初始化，从0x0到第一个非零值。
代理特定信息的建议存储槽如下。可以根据需要在后续 ERC 中添加更多用于附加信息的插槽。

<h4>
逻辑合约地址
</h4>

存储槽0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc （以 获得bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)）。

保存此代理委托给的逻辑合约的地址。如果改为使用信标，则应为空。事件应通知此插槽的更改：

```solidity
event Upgraded(address indexed implementation);
```

<h4>
信标合约地址
</h4>

存储槽0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50（以 获得bytes32(uint256(keccak256('eip1967.proxy.beacon')) - 1)）。

保存此代理所依赖的信标合约的地址（回退）。如果直接使用逻辑地址，则应为空，并且仅在逻辑合约槽为空时才应考虑。事件应通知此插槽的更改：

```solidity
event BeaconUpgraded(address indexed beacon);
```
信标用于将多个代理的逻辑地址保存在一个位置，允许通过修改单个存储槽来升级多个代理。信标合约必须实现以下功能：

```solidity
function implementation() returns (address)
```
基于信标的代理合约不使用逻辑合约槽。相反，他们使用信标合约槽来存储他们所连接的信标的地址。为了知道信标代理使用的逻辑合约，客户端应该：

读取信标逻辑存储槽的信标地址；
调用implementation()信标合约上的函数。
信标合约上的函数结果implementation()不应该依赖于调用者（msg.sender）。



<h4>
管理员地址
</h4>

存储槽0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103 （以 获得bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)）。

持有允许升级此代理的逻辑合约地址的地址（可选）。事件应通知此插槽的更改：

```solidity
event AdminChanged(address previousAdmin, address newAdmin);
```




<h3 id="001">
基本原理
</h3>

这个 EIP 标准化了逻辑合约地址的存储槽，而不是像EIP-897那样的代理合约上的公共方法。这样做的理由是代理不应该向最终用户公开可能与逻辑合约冲突的功能。

请注意，即使在具有不同名称的函数之间也可能发生冲突，因为 ABI 仅依赖于函数选择器的四个字节。这可能会导致意外错误甚至漏洞，其中对代理合约的调用返回与预期不同的值，因为代理拦截了调用并以自己的值进行响应。

来自Nomic Labs 的以太坊代理中的恶意后门：

Proxy 合约中的任何选择器与实现合约中的一个匹配的函数都将被直接调用，完全跳过实现代码。

因为函数选择器使用固定数量的字节，所以总是有可能发生冲突。This isn't an issue for day to day development, given that the Solidity compiler will detect a selector clash within a contract, but this becomes exploitable when selectors are used for cross-contract interaction. 冲突可以被滥用来创建一个看似行为良好的合同，实际上隐藏了一个后门。

代理公共功能具有潜在可利用性的事实使得有必要以不同的方式标准化逻辑合约地址。

选择的存储槽的主要要求是编译器绝不能选择它们来存储任何合约状态变量。否则，逻辑合约在写入自己的变量时可能会无意中覆盖代理上的此信息。

在合约继承链被线性化之后，Solidity 根据声明它们的顺序将变量映射到存储：第一个变量被分配到第一个插槽，依此类推。动态数组和映射中的值例外，它们存储在键和存储槽串联的哈希中。Solidity 开发团队已确认存储布局将在新版本中保留：

存储中状态变量的布局被认为是 Solidity 外部接口的一部分，因为存储指针可以传递给库。这意味着对本节中概述的规则的任何更改都被视为对语言的重大更改，并且由于其关键性质，在执行之前应非常仔细地考虑。如果发生这种重大更改，我们希望发布一种兼容模式，在该模式下编译器将生成支持旧布局的字节码。

Vyper 似乎遵循与 Solidity 相同的策略。请注意，用其他语言或直接以汇编语言编写的合同可能会发生冲突。

它们的选择方式是为了保证它们不会与编译器分配的状态变量发生冲突，因为它们依赖于不以存储索引开头的字符串的哈希值。此外，-1添加了一个偏移量，因此无法知道哈希的原像，从而进一步降低了可能的攻击机会。



<h3 id="001">
参考实现
</h3>

```solidity
/**
 * @dev This contract implements an upgradeable proxy. It is upgradeable because calls are delegated to an
 * implementation address that can be changed. This address is stored in storage in the location specified by
 * https://eips.ethereum.org/EIPS/eip-1967[EIP1967], so that it doesn't conflict with the storage layout of the
 * implementation behind the proxy.
 */
contract ERC1967Proxy is Proxy, ERC1967Upgrade {
    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
     * function call, and allows initializating the storage of the proxy like a Solidity constructor.
     */
    constructor(address _logic, bytes memory _data) payable {
        assert(_IMPLEMENTATION_SLOT == bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1));
        _upgradeToAndCall(_logic, _data, false);
    }

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view virtual override returns (address impl) {
        return ERC1967Upgrade._getImplementation();
    }
}

/**
 * @dev This abstract contract provides getters and event emitting update functions for
 * https://eips.ethereum.org/EIPS/eip-1967[EIP1967] slots.
 */
abstract contract ERC1967Upgrade {
    // This is the keccak-256 hash of "eip1967.proxy.rollback" subtracted by 1
    bytes32 private constant _ROLLBACK_SLOT = 0x4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143;

    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
     * validated in the constructor.
     */
    bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Emitted when the implementation is upgraded.
     */
    event Upgraded(address indexed implementation);

    /**
     * @dev Returns the current implementation address.
     */
    function _getImplementation() internal view returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    /**
     * @dev Stores a new address in the EIP1967 implementation slot.
     */
    function _setImplementation(address newImplementation) private {
        require(Address.isContract(newImplementation), "ERC1967: new implementation is not a contract");
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
    }

    /**
     * @dev Perform implementation upgrade
     *
     * Emits an {Upgraded} event.
     */
    function _upgradeTo(address newImplementation) internal {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    /**
     * @dev Perform implementation upgrade with additional setup call.
     *
     * Emits an {Upgraded} event.
     */
    function _upgradeToAndCall(
        address newImplementation,
        bytes memory data,
        bool forceCall
    ) internal {
        _upgradeTo(newImplementation);
        if (data.length > 0 || forceCall) {
            Address.functionDelegateCall(newImplementation, data);
        }
    }

    /**
     * @dev Perform implementation upgrade with security checks for UUPS proxies, and additional setup call.
     *
     * Emits an {Upgraded} event.
     */
    function _upgradeToAndCallSecure(
        address newImplementation,
        bytes memory data,
        bool forceCall
    ) internal {
        address oldImplementation = _getImplementation();

        // Initial upgrade and setup call
        _setImplementation(newImplementation);
        if (data.length > 0 || forceCall) {
            Address.functionDelegateCall(newImplementation, data);
        }

        // Perform rollback test if not already in progress
        StorageSlot.BooleanSlot storage rollbackTesting = StorageSlot.getBooleanSlot(_ROLLBACK_SLOT);
        if (!rollbackTesting.value) {
            // Trigger rollback using upgradeTo from the new implementation
            rollbackTesting.value = true;
            Address.functionDelegateCall(
                newImplementation,
                abi.encodeWithSignature("upgradeTo(address)", oldImplementation)
            );
            rollbackTesting.value = false;
            // Check rollback was effective
            require(oldImplementation == _getImplementation(), "ERC1967Upgrade: upgrade breaks further upgrades");
            // Finally reset to the new implementation and log the upgrade
            _upgradeTo(newImplementation);
        }
    }

    /**
     * @dev Storage slot with the admin of the contract.
     * This is the keccak-256 hash of "eip1967.proxy.admin" subtracted by 1, and is
     * validated in the constructor.
     */
    bytes32 internal constant _ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    /**
     * @dev Emitted when the admin account has changed.
     */
    event AdminChanged(address previousAdmin, address newAdmin);

    /**
     * @dev Returns the current admin.
     */
    function _getAdmin() internal view returns (address) {
        return StorageSlot.getAddressSlot(_ADMIN_SLOT).value;
    }

    /**
     * @dev Stores a new address in the EIP1967 admin slot.
     */
    function _setAdmin(address newAdmin) private {
        require(newAdmin != address(0), "ERC1967: new admin is the zero address");
        StorageSlot.getAddressSlot(_ADMIN_SLOT).value = newAdmin;
    }

    /**
     * @dev Changes the admin of the proxy.
     *
     * Emits an {AdminChanged} event.
     */
    function _changeAdmin(address newAdmin) internal {
        emit AdminChanged(_getAdmin(), newAdmin);
        _setAdmin(newAdmin);
    }

    /**
     * @dev The storage slot of the UpgradeableBeacon contract which defines the implementation for this proxy.
     * This is bytes32(uint256(keccak256('eip1967.proxy.beacon')) - 1)) and is validated in the constructor.
     */
    bytes32 internal constant _BEACON_SLOT = 0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50;

    /**
     * @dev Emitted when the beacon is upgraded.
     */
    event BeaconUpgraded(address indexed beacon);

    /**
     * @dev Returns the current beacon.
     */
    function _getBeacon() internal view returns (address) {
        return StorageSlot.getAddressSlot(_BEACON_SLOT).value;
    }

    /**
     * @dev Stores a new beacon in the EIP1967 beacon slot.
     */
    function _setBeacon(address newBeacon) private {
        require(Address.isContract(newBeacon), "ERC1967: new beacon is not a contract");
        require(
            Address.isContract(IBeacon(newBeacon).implementation()),
            "ERC1967: beacon implementation is not a contract"
        );
        StorageSlot.getAddressSlot(_BEACON_SLOT).value = newBeacon;
    }

    /**
     * @dev Perform beacon upgrade with additional setup call. Note: This upgrades the address of the beacon, it does
     * not upgrade the implementation contained in the beacon (see {UpgradeableBeacon-_setImplementation} for that).
     *
     * Emits a {BeaconUpgraded} event.
     */
    function _upgradeBeaconToAndCall(
        address newBeacon,
        bytes memory data,
        bool forceCall
    ) internal {
        _setBeacon(newBeacon);
        emit BeaconUpgraded(newBeacon);
        if (data.length > 0 || forceCall) {
            Address.functionDelegateCall(IBeacon(newBeacon).implementation(), data);
        }
    }
}

/**
 * @dev This abstract contract provides a fallback function that delegates all calls to another contract using the EVM
 * instruction `delegatecall`. We refer to the second contract as the _implementation_ behind the proxy, and it has to
 * be specified by overriding the virtual {_implementation} function.
 *
 * Additionally, delegation to the implementation can be triggered manually through the {_fallback} function, or to a
 * different contract through the {_delegate} function.
 *
 * The success and return data of the delegated call will be returned back to the caller of the proxy.
 */
abstract contract Proxy {
    /**
     * @dev Delegates the current call to `implementation`.
     *
     * This function does not return to its internal call site, it will return directly to the external caller.
     */
    function _delegate(address implementation) internal virtual {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    /**
     * @dev This is a virtual function that should be overridden so it returns the address to which the fallback function
     * and {_fallback} should delegate.
     */
    function _implementation() internal view virtual returns (address);

    /**
     * @dev Delegates the current call to the address returned by `_implementation()`.
     *
     * This function does not return to its internal call site, it will return directly to the external caller.
     */
    function _fallback() internal virtual {
        _beforeFallback();
        _delegate(_implementation());
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback() external payable virtual {
        _fallback();
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if call data
     * is empty.
     */
    receive() external payable virtual {
        _fallback();
    }

    /**
     * @dev Hook that is called before falling back to the implementation. Can happen as part of a manual `_fallback`
     * call, or as part of the Solidity `fallback` or `receive` functions.
     *
     * If overridden should call `super._beforeFallback()`.
     */
    function _beforeFallback() internal virtual {}
}

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly {
            r.slot := slot
        }
    }
}
```

<h3 id="001">
注意事项
</h3>

这个 ERC 依赖于这样一个事实，即所选择的存储槽不是由solidity 编译器分配的。这保证了实现合约不会意外覆盖代理运行所需的任何信息。因此，选择具有高插槽号的位置以避免与编译器分配的插槽发生冲突。此外，选择了没有已知原像的位置，以确保使用恶意制作的密钥写入映射不会覆盖它。

打算修改代理特定信息的逻辑合约必须通过写入特定的存储槽来故意这样做（就像 UUPS 的情况一样）。



<h3 id="001">
版权
</h3>

通过CC0放弃版权和相关权利。


