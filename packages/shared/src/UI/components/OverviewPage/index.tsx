import { memo } from 'react'
import { ConnectWallet } from './ConnectWallet.js'
import { PageHeader } from './PageHeader.js'
import { useChainContext } from '@masknet/web3-hooks-base'

interface OverviewPageProps {}

export const OverviewPage = memo<OverviewPageProps>((props) => {
    const { account } = useChainContext()
    if (!account) {
        return <ConnectWallet />
    }
    return <PageHeader />
})
