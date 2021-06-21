import { ChainId, Web3Constants } from '../types'

/**
 * @deprecated Use constantOfChain from @dimensiondev/web3-shared package
 *
 * Before: `getConstant(T, "a", ChainId.Mainnet)`
 *
 * After: `constantOfChain(T, ChainId.Mainnet).a`
 */
export function getConstant<T extends Web3Constants, K extends keyof T>(
    constants: T,
    key: K,
    chainId = ChainId.Mainnet,
): T[K][ChainId.Mainnet] {
    return constants[key][chainId]
}

export function constantOfChain<T extends Web3Constants>(constants: T, chainId: ChainId = ChainId.Mainnet) {
    const chainSpecifiedConstant = {} as { [key in keyof T]: T[key][ChainId.Mainnet] }
    for (const i in constants) chainSpecifiedConstant[i] = constants[i][chainId]
    return chainSpecifiedConstant
}
