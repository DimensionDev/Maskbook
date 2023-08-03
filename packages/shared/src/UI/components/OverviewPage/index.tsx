import { memo } from 'react'
import { ConnectWallet } from './ConnectWallet.js'
import { PageHeader } from './PageHeader.js'

interface OverviewPageProps {}

export const OverviewPage = memo<OverviewPageProps>((props) => {
    // const { account } = useChainContext()
    const account = '0x790116d0685eB197B886DAcAD9C247f785987A4a'
    if (!account) {
        return <ConnectWallet />
    }
    return <PageHeader />
})
