import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
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

class ABI {
    private coder = ABICoder as unknown as ABICoder.AbiCoder
    private abis: Map<string, TransactionMethodABI> = new Map()

    constructor() {
        this.construct(BulkCheckout as AbiItem[]) // donate gitcoin grants
        this.construct(ITO2 as AbiItem[])
        this.construct(NftRedPacket as AbiItem[])
        this.construct(HappyRedPacketV4 as AbiItem[])
        this.construct(MaskBox as AbiItem[])
        this.construct(ERC20 as AbiItem[])
        this.construct(ERC721 as AbiItem[])
        this.construct(RouterV2ABI as AbiItem[]) // uniswap V2 like
        this.construct(SwapRouter as AbiItem[]) // uniswap V3 like
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
                const signature = this.coder.encodeFunctionSignature(
                    `${x.name}(${inputs.map((y) => y.type).join(',')})`,
                )
                if (this.abis.has(signature))
                    console.warn(
                        `The signature of ${`${x.name}(${inputs.map((y) => y.type).join(',')})`} already exists.`,
                    )
                this.abis.set(signature, {
                    name,
                    parameters:
                        inputs.map((y) => ({
                            name: y.name,
                            type: y.type,
                        })) ?? [],
                })
                console.log({ abis: this.abis })
            } catch (error) {
                console.log('Failed to encode function signature from below ABI:')
                console.log(x)
            }
        })
    }
}

const abi = new ABI()

export function readABI(signature?: string) {
    return abi.read(signature)
}
