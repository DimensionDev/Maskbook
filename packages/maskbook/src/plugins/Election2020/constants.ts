import { ChainId } from '../../web3/types'

export const Election2020MetaKey = 'com.maskbook.election2020:1'
export const Election2020PluginID = 'com.maskbook.election2020'

export const ELECTION_2020_CONSTANTS = {
    ELECTION_TOKEN_ADDRESS: {
        [ChainId.Mainnet]: '0x699aa5e6eab40bcda7398ec7e5d585ca5d656a13',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0x37E8EBA765FF3F93c4A8d8eff76DDaA36AE5c0e8',
        [ChainId.Kovan]: '',
    },
}
