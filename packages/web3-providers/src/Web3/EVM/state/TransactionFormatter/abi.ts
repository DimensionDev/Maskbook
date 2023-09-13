import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import { uniqBy } from 'lodash-es'
import type { TransactionMethodABI } from './types.js'

// built-in abis
import BulkCheckout from '@masknet/web3-contracts/abis/BulkCheckout.json'
import NftRedPacket from '@masknet/web3-contracts/abis/NftRedPacket.json'
import HappyRedPacketV4 from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import ERC20 from '@masknet/web3-contracts/abis/ERC20.json'
import ERC721 from '@masknet/web3-contracts/abis/ERC721.json'
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json'
import SwapRouter from '@masknet/web3-contracts/abis/SwapRouter.json'
import MaskBox from '@masknet/web3-contracts/abis/MaskBox.json'
import DODORouteProxy from '@masknet/web3-contracts/abis/DODORouteProxy.json'
import WETH from '@masknet/web3-contracts/abis/WETH.json'
import BancorNetwork from '@masknet/web3-contracts/abis/BancorNetwork.json'
import OpenOceanExchangeV2 from '@masknet/web3-contracts/abis/OpenOceanExchangeV2.json'
import ZeroXSwap from '@masknet/web3-contracts/abis/ZeroXSwap.json'
import Lido from '@masknet/web3-contracts/abis/Lido.json'
import AaveLendingPool from '@masknet/web3-contracts/abis/AaveLendingPool.json'
import SmartPayEntryPoint from '@masknet/web3-contracts/abis/SmartPayEntryPoint.json'
import WalletContract from '@masknet/web3-contracts/abis/Wallet.json'
import Create2Factory from '@masknet/web3-contracts/abis/Create2Factory.json'
import LensHub from '@masknet/web3-contracts/abis/LensHub.json'
import LensFollowNFT from '@masknet/web3-contracts/abis/LensFollowNFT.json'
import Airdrop from '@masknet/web3-contracts/abis/AirdropV2.json'

class ABI {
    private coder = ABICoder as unknown as ABICoder.AbiCoder
    private abis: Map<string, TransactionMethodABI[]> = new Map()

    constructor() {
        this.construct(BulkCheckout as AbiItem[]) // donate gitcoin grants
        this.construct(NftRedPacket as AbiItem[])
        this.construct(HappyRedPacketV4 as AbiItem[])
        this.construct(MaskBox as AbiItem[])
        this.construct(ERC721 as AbiItem[])
        this.construct(ERC20 as AbiItem[])
        this.construct(RouterV2ABI as AbiItem[]) // uniswap V2 like
        this.construct(SwapRouter as AbiItem[]) // uniswap V3 like
        this.construct(DODORouteProxy as AbiItem[]) // dodo swap
        this.construct(BancorNetwork as AbiItem[]) // bancor swap
        this.construct(OpenOceanExchangeV2 as AbiItem[]) // openocean swap
        this.construct(ZeroXSwap as AbiItem[]) // 0x swap
        this.construct(WETH as AbiItem[]) // wrap & unwrap
        this.construct(Lido as AbiItem[]) // lido saving
        this.construct(AaveLendingPool as AbiItem[]) // Aave saving
        this.construct(SmartPayEntryPoint as AbiItem[]) // smart pay entrypoint
        this.construct(WalletContract as AbiItem[]) // Contract Wallet
        this.construct(Create2Factory as AbiItem[]) // Create2Factory
        this.construct(LensHub as AbiItem[])
        this.construct(LensFollowNFT as AbiItem[])
        this.construct(Airdrop as AbiItem[])
    }

    read(signature?: string) {
        if (!signature) return
        return this.abis.get(signature)
    }
    construct(abi: AbiItem[]) {
        abi.forEach((x) => {
            if (x.type !== 'function') return
            if (x.stateMutability === 'pure' || x.stateMutability === 'view') return
            const { name, inputs = [] } = x
            if (!name) return
            try {
                const signature = this.coder.encodeFunctionSignature(x)

                const all = uniqBy(
                    [
                        ...(this.abis.get(signature) ?? []),
                        {
                            name,
                            parameters:
                                inputs.map((y) => ({
                                    name: y.name,
                                    type: y.type,
                                    components: y.components,
                                })) ?? [],
                        },
                    ],
                    (x) => `${x.name}_${x.parameters.map((y) => `${y.type}_${y.name}`)}`,
                )
                this.abis.set(signature, all)
            } catch (error) {
                console.log('Failed to encode function signature from below ABI:')
                console.log(x)
            }
        })
    }
}

let abi: ABI

export function readABIs(signature?: string) {
    return (abi ||= new ABI()).read(signature)
}
