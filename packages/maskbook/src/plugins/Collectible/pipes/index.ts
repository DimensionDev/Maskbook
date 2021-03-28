import { Network } from 'opensea-js'
import { ChainId } from '../../../web3/types'

export function resolveOpenSeaNetwork(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return Network.Main
        case ChainId.Rinkeby:
            return Network.Rinkeby
        default:
            throw new Error(`The chain id ${chainId} is not supported.`)
    }
}
