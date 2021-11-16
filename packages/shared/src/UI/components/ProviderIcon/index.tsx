import { HelpCircle } from 'react-feather'
import { makeStyles } from '@masknet/theme'
import { InjectedProviderType, ProviderType } from '@masknet/web3-shared-evm'
import { useStylesExtends } from '../../UIHelper/custom-ui-helper'

const useStyles = makeStyles()({
    icon: {},
})

const icons: Record<ProviderType, string> = {
    [ProviderType.MaskWallet]: new URL('../../../../assets/maskwallet.png', import.meta.url).toString(),
    [ProviderType.MetaMask]: new URL('../../../../assets/metamask.png', import.meta.url).toString(),
    [ProviderType.WalletConnect]: new URL('../../../../assets/walletconnect.png', import.meta.url).toString(),
    [ProviderType.Injected]: '',
    [ProviderType.CustomNetwork]: '',
}

const injectedIcons: Record<InjectedProviderType, string> = {
    [InjectedProviderType.MetaMask]: new URL('../../../../assets/metamask.png', import.meta.url).toString(),
    [InjectedProviderType.MathWallet]: new URL('../../../../assets/mathwallet.png', import.meta.url).toString(),
    [InjectedProviderType.Coin98]: new URL('../../../../assets/coin98.png', import.meta.url).toString(),
    [InjectedProviderType.WalletLink]: new URL('../../../../assets/coinbase.png', import.meta.url).toString(),
    [InjectedProviderType.Unknown]: new URL('../../../../assets/metamask.png', import.meta.url).toString(),
}

export interface ProviderIconProps extends withClasses<'icon'> {
    size?: number
    providerType?: ProviderType
    injectedProviderType?: InjectedProviderType
}

export function ProviderIcon(props: ProviderIconProps) {
    const { size = 40, providerType, injectedProviderType } = props
    const classes = useStylesExtends(useStyles(), props)

    if (!providerType) return null

    const iconURL = icons[providerType] || (injectedProviderType ? injectedIcons[injectedProviderType] : '')

    // a question mark icon as fallback
    if (!iconURL) return <HelpCircle className={classes.icon} size={size} />

    return (
        <img
            className={classes.icon}
            src={iconURL}
            style={{
                width: size,
                height: size,
                borderRadius:
                    providerType === ProviderType.Injected && injectedProviderType === InjectedProviderType.MathWallet
                        ? '50%'
                        : '',
            }}
        />
    )
}
