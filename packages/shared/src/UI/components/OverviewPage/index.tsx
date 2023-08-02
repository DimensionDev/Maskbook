import { useChainContext } from '@masknet/web3-hooks-base'
import { memo } from 'react'
import { ConnectWallet } from './ConnectWallet.js'

interface OverviewPageProps {}

export const OverviewPage = memo<OverviewPageProps>((props) => {
    const { account } = useChainContext()

    if (!account) {
        return <ConnectWallet />
    }
    return <div />
})
