import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { MetaMaskIcon } from '../../resources/MetaMaskIcon'
import { WalletConnectIcon } from '../../resources/WalletConnectIcon'
import { makeStyles } from '@masknet/theme'
import { ProviderType } from '@masknet/web3-shared'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()({
    icon: {
        fontSize: 40,
        width: 40,
        height: 40,
    },
})

export interface ProviderIconProps extends withClasses<'icon'> {
    size?: number
    providerType?: ProviderType
}

export function ProviderIcon(props: ProviderIconProps) {
    const { size = 40, providerType } = props
    const classes = useStylesExtends(useStyles(), props)
    const style = {
        height: size,
        width: size,
    }

    switch (providerType) {
        case ProviderType.Maskbook:
            return <MaskbookIcon classes={{ root: classes.icon }} style={style} viewBox={`0 0 ${size} ${size}`} />
        case ProviderType.MetaMask:
            return <MetaMaskIcon classes={{ root: classes.icon }} style={style} viewBox={`0 0 ${size} ${size}`} />
        case ProviderType.WalletConnect:
            return <WalletConnectIcon classes={{ root: classes.icon }} style={style} viewBox={`0 0 ${size} ${size}`} />
        default:
            return null
    }
}
