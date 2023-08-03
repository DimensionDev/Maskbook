import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { useChainIdValid, useNetworkDescriptor, useProviderDescriptor } from '@masknet/web3-hooks-base'
import { WalletStatusBox } from '../WalletStatusBox/index.js'

interface PageHeaderProps {}

const useStyles = makeStyles()((theme) => ({
    root: {},
}))

export const PageHeader = memo<PageHeaderProps>((props) => {
    const { classes } = useStyles()
    const providerDescriptor = useProviderDescriptor<'all'>()
    const chainIdValid = useChainIdValid()
    const networkDescriptor = useNetworkDescriptor()

    console.log(providerDescriptor)
    return (
        <div>
            <WalletStatusBox />
        </div>
    )
})
