import { NetworkIcon, ProviderIcon, useValueRef } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { currentNetworkSettings, currentProviderSettings } from '../../plugins/Wallet/settings'
import classNames from 'classnames'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()({
    root: {
        position: 'relative',
        display: 'flex',
    },
    mainIcon: {
        width: '100%',
        height: '100%',
    },
    badgeIcon: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#ffffff',
        borderRadius: '50%',
    },
})

interface WalletIconProps extends withClasses<'networkIcon' | 'providerIcon'> {
    size?: number
    badgeSize?: number
}

export const WalletIcon = (props: WalletIconProps) => {
    const classes = useStylesExtends(useStyles(), props)
    const { size = 24, badgeSize = 14 } = props
    const selectedNetwork = useValueRef(currentNetworkSettings)
    const selectedWalletProvider = useValueRef(currentProviderSettings)
    return (
        <div
            className={classes.root}
            style={{
                height: size,
                width: size,
            }}>
            <NetworkIcon
                classes={{ icon: classNames(classes.mainIcon, classes.networkIcon) }}
                size={size}
                networkType={selectedNetwork}
            />
            <ProviderIcon
                classes={{ icon: classNames(classes.badgeIcon, classes.providerIcon) }}
                size={badgeSize}
                providerType={selectedWalletProvider}
            />
        </div>
    )
}
