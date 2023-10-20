import { configureChains, createConfig, type Config, type WebSocketPublicClient } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import type { Chain, FallbackTransport, PublicClient } from 'viem'
import { arbitrum, aurora, avalanche, bsc, fantom, gnosis, mainnet, optimism, polygon } from 'viem/chains'

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, bsc, polygon, arbitrum, gnosis, fantom, avalanche, aurora, optimism],
    [publicProvider()],
)

export const config: Config<
    PublicClient<FallbackTransport, Chain>,
    WebSocketPublicClient<FallbackTransport>
> = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
})

config.subscribe((state) => {
    console.log('DEBUG: state')
    console.log(state)
})
