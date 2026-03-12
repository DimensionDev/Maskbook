import { isUndefined, omitBy } from 'lodash-es'
import { createContract } from '@masknet/web3-shared-evm'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker.js'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165.js'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'
import type { ERC1155 } from '@masknet/web3-contracts/types/ERC1155.js'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import type { AirdropV2 } from '@masknet/web3-contracts/types/AirdropV2.js'

import { AirdropV2Abi as AirDropV2ABI } from '@masknet/web3-contracts/types/AirdropV2.js'
import { BalanceCheckerAbi as BalanceCheckerABI } from '@masknet/web3-contracts/types/BalanceChecker.js'
import { ERC20Abi as ERC20ABI } from '@masknet/web3-contracts/types/ERC20.js'
import { ERC20Bytes32Abi as ERC20Bytes32ABI } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import { ERC165Abi as ERC165ABI } from '@masknet/web3-contracts/types/ERC165.js'
import { ERC721Abi as ERC721ABI } from '@masknet/web3-contracts/types/ERC721.js'
import { ERC1155Abi as ERC1155ABI } from '@masknet/web3-contracts/types/ERC1155.js'
import { WalletAbi as WalletABI } from '@masknet/web3-contracts/types/Wallet.js'

import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import type { EVMConnectionOptions } from '../types/index.js'
import type { Abi } from 'viem'

export class EVMContractReadonlyAPI {
    static Default = new EVMContractReadonlyAPI()
    constructor(protected options?: EVMConnectionOptions) {
        this.Request = new EVMRequestReadonlyAPI(options)
    }
    protected Request

    getWeb3Contract<T extends BaseContract>(address: string | undefined, abi: Abi, initial?: EVMConnectionOptions) {
        const web3 = this.Request.getWeb3(initial)
        const options = omitBy(
            {
                from: initial?.overrides?.from ?? initial?.account,
            },
            isUndefined,
        )
        return createContract<T>(web3, address, abi, options)
    }

    getERC20Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC20>(address, ERC20ABI, initial)
    }

    getERC20Bytes32Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC20Bytes32>(address, ERC20Bytes32ABI, initial)
    }

    getERC721Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC721>(address, ERC721ABI, initial)
    }

    getERC1155Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC1155>(address, ERC1155ABI, initial)
    }

    getERC165Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<ERC165>(address, ERC165ABI, initial)
    }

    getBalanceCheckerContract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<BalanceChecker>(address, BalanceCheckerABI, initial)
    }

    getWalletContract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<Wallet>(address, WalletABI, initial)
    }

    getAirdropV2Contract(address: string | undefined, initial?: EVMConnectionOptions) {
        return this.getWeb3Contract<AirdropV2>(address, AirDropV2ABI, initial)
    }
}
export const EVMContractReadonly = EVMContractReadonlyAPI.Default
