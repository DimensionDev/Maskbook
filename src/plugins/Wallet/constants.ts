import { ChainId } from '../../web3/types'

//#region plugin definitions
export const PLUGIN_IDENTIFIER = 'com.maskbook.wallet'
//#endregion

export const WALLET_CONSTANTS = {
    // contracts
    BALANCE_CHECKER_ADDRESS: {
        [ChainId.Mainnet]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [ChainId.Ropsten]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [ChainId.Rinkeby]: '0xe3AE8Ae4160680C7Ac0FB0A79F519d7D7eAe06aB',
        [ChainId.Kovan]: '',
    },
}
