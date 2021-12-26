import { makeStyles } from '@masknet/theme'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useStylesExtends } from '../../UIHelper/custom-ui-helper'
import { MaskBlueIcon, MetaMaskIcon, WalletConnectIcon } from '@masknet/icons'

const useStyles = makeStyles()({
    icon: {},
})

export interface ProviderIconProps extends withClasses<'icon'> {
    size?: number
    providerType?: ProviderType
}

export function ProviderIcon(props: ProviderIconProps) {
    const { size = 40, providerType } = props
    const classes = useStylesExtends(useStyles(), props)

    switch (providerType) {
        case ProviderType.MaskWallet:
            return <MaskBlueIcon classes={{ root: classes.icon }} sx={{ fontSize: size }} />
        case ProviderType.MetaMask:
            return <MetaMaskIcon classes={{ root: classes.icon }} sx={{ fontSize: size }} />
        case ProviderType.WalletConnect:
            return <WalletConnectIcon classes={{ root: classes.icon }} sx={{ fontSize: size }} />
        default:
            return null
    }
}
