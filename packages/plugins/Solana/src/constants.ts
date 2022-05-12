import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'
import { PublicKey } from '@solana/web3.js'

export const PLUGIN_META_KEY = 'com.mask.solana'
export const PLUGIN_ID = 'com.mask.solana'
export const PLUGIN_NAME = 'Solana Chain'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_solana`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Solana,
        name: 'Solana',
        icon: new URL('./assets/solana.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_solana_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Solana,
        name: 'Solana Testnet',
        icon: new URL('./assets/solana.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: false,
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_phantom`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Phantom,
        name: 'Phantom',
        icon: new URL('./assets/phantom.png', import.meta.url),
        backgroundGradient:
            'linear-gradient(90deg, rgba(84, 63, 196, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
]

export const NETWORK_ENDPOINTS: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana-api.projectserum.com',
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
}
export const ENDPOINT_KEY = 'mainnet-beta'
export const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')
