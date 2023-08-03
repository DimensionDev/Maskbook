import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import {
    useChainContext,
    useChainIdValid,
    useNetworkContext,
    useNetworkDescriptor,
    useProviderDescriptor,
} from '@masknet/web3-hooks-base'
import { WalletStatusBox } from '../WalletStatusBox/index.js'
import { PageContent } from './PageContent.js'
import { ChainRuntimeProvider } from '../AssetsManagement/ChainRuntimeProvider.js'

interface PageHeaderProps {}

const useStyles = makeStyles()((theme) => ({
    root: {},
}))

export const PageHeader = memo<PageHeaderProps>((props) => {
    const { classes } = useStyles()
    const providerDescriptor = useProviderDescriptor<'all'>()
    const chainIdValid = useChainIdValid()
    const networkDescriptor = useNetworkDescriptor()
    const account = '0x790116d0685eB197B886DAcAD9C247f785987A4a'
    const { pluginID } = useNetworkContext()
    const { chainId } = useChainContext()

    return (
        <ChainRuntimeProvider pluginID={pluginID} defaultChainId={chainId} account={account}>
            <WalletStatusBox />
            <PageContent account={account} />
        </ChainRuntimeProvider>
    )
})
