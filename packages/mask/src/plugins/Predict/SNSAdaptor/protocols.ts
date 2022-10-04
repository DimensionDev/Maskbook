import { ChainId } from '@masknet/web3-shared-evm'

export const PLUGIN_AZURO_ID = 'org.azuro'

export const protocols = {
    [ChainId.xDai.valueOf()]: {
        supportedProtocols: [PLUGIN_AZURO_ID],
    },
}
