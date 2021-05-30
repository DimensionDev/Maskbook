import { ChainId } from '@dimensiondev/web3-shared'

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
