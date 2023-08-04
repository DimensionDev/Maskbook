import { memo } from 'react'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { WalletStatusBox } from '../WalletStatusBox/index.js'
import { PageContent } from './PageContent.js'
import { ChainRuntimeProvider } from '../AssetsManagement/ChainRuntimeProvider.js'

interface PageHeaderProps {}

export const PageHeader = memo<PageHeaderProps>((props) => {
    const { pluginID } = useNetworkContext()
    const { chainId, account } = useChainContext()

    return (
        <ChainRuntimeProvider pluginID={pluginID} defaultChainId={chainId} account={account}>
            <WalletStatusBox />
            <PageContent account={account} />
        </ChainRuntimeProvider>
    )
})
