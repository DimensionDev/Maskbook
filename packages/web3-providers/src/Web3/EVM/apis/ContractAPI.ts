import type { AbiItem } from 'web3-utils'
import { createContract } from '@masknet/web3-shared-evm'
import AirDropV2ABI from '@masknet/web3-contracts/abis/AirdropV2.json'
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
import type { LensFollowNFT } from '@masknet/web3-contracts/types/LensFollowNFT.js'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import ERC1155ABI from '@masknet/web3-contracts/abis/ERC1155.json'
import CryptoPunksABI from '@masknet/web3-contracts/abis/CryptoPunks.json'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import MulticallABI from '@masknet/web3-contracts/abis/Multicall.json'
import LensFollowNFT_ABI from '@masknet/web3-contracts/abis/LensFollowNFT.json'
import { RequestAPI } from './RequestAPI.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { ConnectionOptions } from '../types/index.js'

export class ContractAPI {
    constructor(private options?: ConnectionOptions) {}

    private Request = new RequestAPI(this.options)
    private ConnectionOptions = new ConnectionOptionsAPI(this.options)

    getWeb3Contract<T extends BaseContract>(address: string, ABI: AbiItem[], initial?: ConnectionOptions) {
        const web3 = this.Request.getWeb3(initial)
        return createContract<T>(web3, address, ABI)
    }

    getERC20Contract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], options)
    }

    getERC20Bytes32Contract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<ERC20Bytes32>(address, ERC20Bytes32ABI as AbiItem[], options)
    }

    getERC721Contract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
    }

    getERC1155Contract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<ERC1155>(address, ERC1155ABI as AbiItem[], options)
    }

    getERC165Contract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<ERC165>(address, ERC165ABI as AbiItem[], options)
    }

    getCryptoPunksContract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<CryptoPunks>(address, CryptoPunksABI as AbiItem[], options)
    }

    getBalanceCheckerContract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<BalanceChecker>(address, BalanceCheckerABI as AbiItem[], options)
    }

    getWalletContract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<Wallet>(address, WalletABI as AbiItem[], options)
    }

    getMulticallContract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<Multicall>(address, MulticallABI as AbiItem[], options)
    }

    getAirdropV2Contract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<AirdropV2>(address, AirDropV2ABI as AbiItem[], options)
    }

    getLensFollowNFT_Contract(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3Contract<LensFollowNFT>(address, LensFollowNFT_ABI as AbiItem[], options)
    }
}
