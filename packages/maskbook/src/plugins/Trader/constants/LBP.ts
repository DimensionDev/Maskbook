import { ChainId } from '@masknet/web3-shared'

/**
 * @deprecated Use @masknet/constants
 */
export const LBP_CONSTANTS = {
    BALANCER_POOLS_SUBGRAPH_URL: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
}
