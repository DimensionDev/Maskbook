import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { MetaMaskIcon } from '../../resources/MetaMaskIcon'
import { WalletConnectIcon } from '../../resources/WalletConnectIcon'
import { makeStyles, Theme } from '@material-ui/core'
import { ProviderType } from '../../web3/types'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles((theme: Theme) => ({
    icon: {
        fontSize: 40,
        width: 40,
        height: 40,
    },
}))

export interface ProviderIconProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    size?: number
    providerType?: ProviderType
}

export function ProviderIcon(props: ProviderIconProps) {
    const { size = 40, providerType } = props
    const classes = useStylesExtends(useStyles(), props)

    switch (providerType) {
        case ProviderType.Maskbook:
            return <MaskbookIcon classes={{ root: classes.icon }} viewBox={`0 0 ${size} ${size}`} />
        case ProviderType.MetaMask:
            return <MetaMaskIcon classes={{ root: classes.icon }} viewBox={`0 0 ${size} ${size}`} />
        case ProviderType.WalletConnect:
            return <WalletConnectIcon classes={{ root: classes.icon }} viewBox={`0 0 ${size} ${size}`} />
        default:
            return null
    }
}
