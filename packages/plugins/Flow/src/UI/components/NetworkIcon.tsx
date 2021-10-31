import type { ChainId, ProviderType } from '@masknet/web3-shared-flow'

export interface NetworkIconProps {
    size: number
    chainId: ChainId
    // if exists, a small provider icon will add a provider cion on the right bottom side
    providerType?: ProviderType
}

export function NetworkIcon(props: NetworkIconProps) {
    return <></>
}
