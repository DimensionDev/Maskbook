import { PluginId } from '@masknet/plugin-infra'
import { FungibleToken, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'

export const PLUGIN_NAME = 'CRYPTOART.AI'
export const PLUGIN_DESCRIPTION = 'The decentralized world of CryptoArt.'
export const PLUGIN_ID = PluginId.CryptoArtAI

export const prefixPath = '/gallery/detail'

export const mainNetwork = {
    contractAddress: '0x3AD503084f1bD8d15A7F5EbE7A038C064e1E3Fa1',
    hostname: 'cryptoart.ai',
    endpoint: 'https://api.cryptoart.ai',
    paymentToken: {
        id: ZERO_ADDRESS,
        schema: SchemaType.Native,
        type: TokenType.Fungible,
        chainId: ChainId.Mainnet,
        address: ZERO_ADDRESS,
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    } as FungibleToken<ChainId, SchemaType>,
}

export const testNetwork = {
    contractAddress: '0x54395e6c737734D3de29Fc62C10a3ed51eFA2E8A',
    hostname: 'testweb.cryptoart.ai',
    endpoint: 'https://apitest.cryptoart.ai',
    paymentToken: {
        id: ZERO_ADDRESS,
        schema: SchemaType.Native,
        type: TokenType.Fungible,
        chainId: ChainId.Kovan,
        address: ZERO_ADDRESS,
        decimals: 18,
        name: 'Kovan Ether',
        symbol: 'KOV',
    } as FungibleToken<ChainId, SchemaType>,
}
