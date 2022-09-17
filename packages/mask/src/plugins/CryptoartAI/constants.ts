import { PluginID } from '@masknet/plugin-infra'
import { ChainId, createNativeToken } from '@masknet/web3-shared-evm'

export const PLUGIN_NAME = 'CRYPTOART.AI'
export const PLUGIN_DESCRIPTION = 'The decentralized world of CryptoArt.'
export const PLUGIN_ID = PluginID.CryptoArtAI

export const prefixPath = '/gallery/detail'

export const mainNetwork = {
    contractAddress: '0x3AD503084f1bD8d15A7F5EbE7A038C064e1E3Fa1',
    hostname: 'cryptoart.ai',
    endpoint: 'https://api.cryptoart.ai',
    paymentToken: createNativeToken(ChainId.Mainnet),
}

export const testNetwork = {
    contractAddress: '0x54395e6c737734D3de29Fc62C10a3ed51eFA2E8A',
    hostname: 'testweb.cryptoart.ai',
    endpoint: 'https://apitest.cryptoart.ai',
    paymentToken: createNativeToken(ChainId.Kovan),
}
