import type { Chain, FallbackTransport, PublicClient } from 'viem'
import { arbitrum, aurora, avalanche, bsc, fantom, gnosis, mainnet, optimism, polygon } from 'viem/chains'
import { configureChains, createConfig, type Config, type WebSocketPublicClient } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'

const { chains, publicClient } = configureChains(
    [mainnet, bsc, polygon, arbitrum, gnosis, fantom, avalanche, aurora, optimism],
    [publicProvider()],
)

export const config: Config<
    PublicClient<FallbackTransport, Chain>,
    WebSocketPublicClient<FallbackTransport>
> = createConfig({
    autoConnect: true,
    publicClient,
})
