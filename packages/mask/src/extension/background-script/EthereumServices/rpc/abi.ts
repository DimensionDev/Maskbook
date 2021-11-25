import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import ERC20 from '@masknet/web3-contracts/abis/ERC20.json' // common ERC20 like
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json' // uniswap V2 like
import SwapRouter from '@masknet/web3-contracts/abis/SwapRouter.json' // uniswap V3 like

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
        const { name, inputs = [] } = x
        if (!name) return
        ABI_MAP.set(coder.encodeFunctionSignature(`${x.name}(${inputs.map((y) => y.type).join(',')})`), {
            name,
            parameters:
                inputs.map((y) => ({
                    name: y.name,
                    type: y.type,
                })) ?? [],
        })
    })
}

constructABI(ERC20 as AbiItem[])
constructABI(RouterV2ABI as AbiItem[])
constructABI(SwapRouter as AbiItem[])
//#endregion
