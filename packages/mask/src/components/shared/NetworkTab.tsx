import { ConcealableTabs } from '@masknet/shared'
import { ChainId, getChainDetailed } from '@masknet/web3-shared-evm'
import type { HTMLProps } from 'react'

interface NetworkTabProps extends Omit<HTMLProps<HTMLDivElement>, 'onChange'> {
    chains: ChainId[]
    setChainId: (chainId: ChainId) => void
    chainId: ChainId
}
export function NetworkTab(props: NetworkTabProps) {
    const { chainId, setChainId, chains, ...rest } = props

    const tabs = chains.map((chainId) => ({
        id: chainId,
        label: getChainDetailed(chainId)?.chain ?? 'Unknown',
    }))

    return <ConcealableTabs tabs={tabs} selectedId={chainId} onChange={setChainId} {...rest} />
}
