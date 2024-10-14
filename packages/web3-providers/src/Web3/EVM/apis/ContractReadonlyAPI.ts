import type { AbiItem } from 'web3-utils'
import { isUndefined, omitBy } from 'lodash-es'
import { createContract } from '@masknet/web3-shared-evm'
import AirDropV2ABI from '@masknet/web3-contracts/abis/AirdropV2.json' with { type: 'json' }
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker.js'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165.js'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'
import type { ERC1155 } from '@masknet/web3-contracts/types/ERC1155.js'
import type { CryptoPunks } from '@masknet/web3-contracts/types/CryptoPunks.js'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import type { Multicall } from '@masknet/web3-contracts/types/Multicall.js'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import type { AirdropV2 } from '@masknet/web3-contracts/types/AirdropV2.js'
import type { WETH } from '@masknet/web3-contracts/types/WETH.js'
import type { PoolStateV3 } from '@masknet/web3-contracts/types/PoolStateV3.js'
import type { FriendTech } from '@masknet/web3-contracts/types/FriendTech.js'

import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json' with { type: 'json' }
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json' with { type: 'json' }
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json' with { type: 'json' }
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json' with { type: 'json' }
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json' with { type: 'json' }
import ERC1155ABI from '@masknet/web3-contracts/abis/ERC1155.json' with { type: 'json' }
import CryptoPunksABI from '@masknet/web3-contracts/abis/CryptoPunks.json' with { type: 'json' }
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json' with { type: 'json' }
import MulticallABI from '@masknet/web3-contracts/abis/Multicall.json' with { type: 'json' }
import WETH_ABI from '@masknet/web3-contracts/abis/WETH.json' with { type: 'json' }
import PoolStateV3ABI from '@masknet/web3-contracts/abis/PoolStateV3.json' with { type: 'json' }
import FriendTechABI from '@masknet/web3-contracts/abis/FriendTech.json' with { type: 'json' }

import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import type { EVMConnectionOptions } from '../types/index.js'

export class EVMContractReadonlyAPI {
    static Default = new EVMContractReadonlyAPI()
    constructor(protected options?: EVMConnectionOptions) {
        this.Request = new EVMRequestReadonlyAPI(options)
    }
    protected Request

    getWeb3Contract<T extends BaseContract>(
        address: string | undefined,
        ABI: AbiItem[],
        initial?: EVMConnectionOptions,
    ) {
        const web3 = this.Request.getWeb3(initial)
        const options = omitBy(
            {
                from: initial?.overrides?.from ?? initial?.account,
            },
            isUndefined,
        )
        return createContract<T>(web3, address, ABI, options)
    }

    getERC20Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], initial)
    }

    getERC20Bytes32Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC20Bytes32>(address, ERC20Bytes32ABI as AbiItem[], initial)
    }

    getERC721Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], initial)
    }

    getERC1155Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC1155>(address, ERC1155ABI as AbiItem[], initial)
    }

    getERC165Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC165>(address, ERC165ABI as AbiItem[], initial)
    }

    getCryptoPunksContract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<CryptoPunks>(address, CryptoPunksABI as AbiItem[], initial)
    }

    getBalanceCheckerContract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<BalanceChecker>(address, BalanceCheckerABI as AbiItem[], initial)
    }

    getWalletContract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<Wallet>(address, WalletABI as AbiItem[], initial)
    }

    getMulticallContract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<Multicall>(address, MulticallABI as AbiItem[], initial)
    }

    getAirdropV2Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<AirdropV2>(address, AirDropV2ABI as AbiItem[], initial)
    }

    getWETHContract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<WETH>(address, WETH_ABI as AbiItem[], initial)
    }

    getPoolStateV3(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<PoolStateV3>(address, PoolStateV3ABI as AbiItem[], initial)
    }

    getFriendTech(address: string, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<FriendTech>(address, FriendTechABI as AbiItem[], initial)
    }
}
export const EVMContractReadonly = EVMContractReadonlyAPI.Default
