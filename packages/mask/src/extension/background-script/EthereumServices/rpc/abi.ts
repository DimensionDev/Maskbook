import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'

// built in abis
import BulkCheckout from '@masknet/web3-contracts/abis/BulkCheckout.json'
import ITO2 from '@masknet/web3-contracts/abis/ITO2.json'
import HappyRedPacketV4 from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import ERC20 from '@masknet/web3-contracts/abis/ERC20.json'
import ERC721 from '@masknet/web3-contracts/abis/ERC721.json'
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json'
import SwapRouter from '@masknet/web3-contracts/abis/SwapRouter.json'
import MaskBox from '@masknet/web3-contracts/abis/MaskBox.json'

// fix the type error
const coder = ABICoder as unknown as ABICoder.AbiCoder

type InternalItem = {
    name: string
    parameters: {
        name: string
        type: string
    }[]
}

const ABI_MAP: Map<string, InternalItem> = new Map()

export function readABI(sig?: string) {
    if (!sig) return
    return ABI_MAP.get(sig)
}

//#region construct built-in abis
function constructABI(abi: AbiItem[]) {
    abi.forEach((x) => {
        if (x.type !== 'function') return
        if (x.stateMutability === 'pure' || x.stateMutability === 'view') return
        const { name, inputs = [] } = x
        if (!name) return
        try {
            ABI_MAP.set(coder.encodeFunctionSignature(`${x.name}(${inputs.map((y) => y.type).join(',')})`), {
                name,
                parameters:
                    inputs.map((y) => ({
                        name: y.name,
                        type: y.type,
                    })) ?? [],
            })
        } catch (error) {
            console.log('Failed to encode function signature from below ABI:')
            console.log(x)
        }
    })
}

constructABI(BulkCheckout as AbiItem[]) // donate gitcoin grants
constructABI(ITO2 as AbiItem[])
constructABI(HappyRedPacketV4 as AbiItem[])
constructABI(MaskBox as AbiItem[])
constructABI(ERC20 as AbiItem[])
constructABI(ERC721 as AbiItem[])
constructABI(RouterV2ABI as AbiItem[]) // uniswap V2 like
constructABI(SwapRouter as AbiItem[]) // uniswap V3 like
//#endregion
