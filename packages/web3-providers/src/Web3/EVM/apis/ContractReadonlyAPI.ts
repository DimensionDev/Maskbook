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
import type { RouterV2 } from '@masknet/web3-contracts/types/RouterV2.js'
import type { SwapRouter } from '@masknet/web3-contracts/types/SwapRouter.js'
import type { WETH } from '@masknet/web3-contracts/types/WETH.js'
import type { Pair } from '@masknet/web3-contracts/types/Pair.js'
import type { ExchangeProxy } from '@masknet/web3-contracts/types/ExchangeProxy.js'
import type { Quoter } from '@masknet/web3-contracts/types/Quoter.js'
import type { PoolStateV3 } from '@masknet/web3-contracts/types/PoolStateV3.js'

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
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json'
import SwapRouterABI from '@masknet/web3-contracts/abis/SwapRouter.json'
import WETH_ABI from '@masknet/web3-contracts/abis/WETH.json'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import ExchangeProxyABI from '@masknet/web3-contracts/abis/ExchangeProxy.json'
import QuoterABI from '@masknet/web3-contracts/abis/Quoter.json'
import PoolStateV3ABI from '@masknet/web3-contracts/abis/PoolStateV3.json'

import { RequestReadonlyAPI } from './RequestReadonlyAPI.js'
import type { ConnectionOptions } from '../types/index.js'

export class ContractReadonlyAPI {
    constructor(protected options?: ConnectionOptions) {}

    protected Request = new RequestReadonlyAPI(this.options)

    getWeb3Contract<T extends BaseContract>(address: string | undefined, ABI: AbiItem[], initial?: ConnectionOptions) {
        const web3 = this.Request.getWeb3(initial)
        return createContract<T>(web3, address, ABI)
    }

    getERC20Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], initial)
    }

    getERC20Bytes32Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<ERC20Bytes32>(address, ERC20Bytes32ABI as AbiItem[], initial)
    }

    getERC721Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], initial)
    }

    getERC1155Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<ERC1155>(address, ERC1155ABI as AbiItem[], initial)
    }

    getERC165Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<ERC165>(address, ERC165ABI as AbiItem[], initial)
    }

    getCryptoPunksContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<CryptoPunks>(address, CryptoPunksABI as AbiItem[], initial)
    }

    getBalanceCheckerContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<BalanceChecker>(address, BalanceCheckerABI as AbiItem[], initial)
    }

    getWalletContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<Wallet>(address, WalletABI as AbiItem[], initial)
    }

    getMulticallContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<Multicall>(address, MulticallABI as AbiItem[], initial)
    }

    getAirdropV2Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<AirdropV2>(address, AirDropV2ABI as AbiItem[], initial)
    }

    getLensFollowNFT_Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<LensFollowNFT>(address, LensFollowNFT_ABI as AbiItem[], initial)
    }

    getPairContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<Pair>(address, PairABI as AbiItem[], initial)
    }

    getRouterV2Contract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<RouterV2>(address, RouterV2ABI as AbiItem[], initial)
    }

    getSwapRouterContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<SwapRouter>(address, SwapRouterABI as AbiItem[], initial)
    }

    getWETHContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<WETH>(address, WETH_ABI as AbiItem[], initial)
    }

    getExchangeProxyContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<ExchangeProxy>(address, ExchangeProxyABI as AbiItem[], initial)
    }

    getQuoterContract(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<Quoter>(address, QuoterABI as AbiItem[], initial)
    }

    getPoolStateV3(address: string | undefined, initial?: ConnectionOptions) {
        return this.getWeb3Contract<PoolStateV3>(address, PoolStateV3ABI as AbiItem[], initial)
    }
}
