import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import { uniqBy } from 'lodash-unified'
import type { TransactionMethodABI } from './types'

// built-in abis
import BulkCheckout from '@masknet/web3-contracts/abis/BulkCheckout.json'
import ITO2 from '@masknet/web3-contracts/abis/ITO2.json'
import NftRedPacket from '@masknet/web3-contracts/abis/NftRedPacket.json'
import HappyRedPacketV4 from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import ERC20 from '@masknet/web3-contracts/abis/ERC20.json'
import ERC721 from '@masknet/web3-contracts/abis/ERC721.json'
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json'
import SwapRouter from '@masknet/web3-contracts/abis/SwapRouter.json'
import MaskBox from '@masknet/web3-contracts/abis/MaskBox.json'
import DODORouteProxy from '@masknet/web3-contracts/abis/DODORouteProxy.json'
import BancorNetwork from '@masknet/web3-contracts/abis/BancorNetwork.json'
import OpenOceanExchangeV2 from '@masknet/web3-contracts/abis/OpenOceanExchangeV2.json'
import zeroXSwap from '@masknet/web3-contracts/abis/zeroXSwap.json'

class ABI {
    private coder = ABICoder as unknown as ABICoder.AbiCoder
    private abis: Map<string, TransactionMethodABI[]> = new Map()

    constructor() {
        this.construct(BulkCheckout as AbiItem[]) // donate gitcoin grants
        this.construct(ITO2 as AbiItem[])
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
        this.construct(zeroXSwap as AbiItem[]) // 0x swap
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

const abi = new ABI()

export function readABIs(signature?: string) {
    return abi.read(signature)
}
