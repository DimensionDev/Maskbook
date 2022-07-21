import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'

export interface Web3FeedPageProps {
    persona?: string
    socialAddress?: SocialAddress<NetworkPluginID>
}

export function Web3FeedPage({ socialAddress, persona }: Web3FeedPageProps) {
    if (!socialAddress) return null

    return <div>a</div>
}
