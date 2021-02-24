import { ChainId } from '../../../web3/types'

export const LBP_CONSTANTS = {
    BALANCER_POOLS_SUBGRAPH_URL: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}
