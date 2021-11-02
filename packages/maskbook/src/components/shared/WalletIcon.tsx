import { NetworkIcon, ProviderIcon, useValueRef } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { currentNetworkSettings, currentProviderSettings } from '../../plugins/Wallet/settings'
import classNames from 'classnames'
import { useStylesExtends } from '@masknet/shared'

interface StyleProps {
    size: number
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        position: 'relative',
        display: 'flex',
        height: props.size,
        width: props.size,
    },
    mainIcon: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
    badgeIcon: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#ffffff',
        borderRadius: '50%',
    },
}))

interface WalletIconProps extends withClasses<'networkIcon' | 'providerIcon'> {
    size?: number
    badgeSize?: number
}

export const WalletIcon = (props: WalletIconProps) => {
    const { size = 24, badgeSize = 14 } = props
    const classes = useStylesExtends(useStyles({ size: badgeSize > size ? badgeSize : size }), props)
    const selectedNetwork = useValueRef(currentNetworkSettings)
    const selectedWalletProvider = useValueRef(currentProviderSettings)
    return (
        <div className={classes.root}>
            <NetworkIcon
                classes={{
                    icon: classNames(badgeSize > size ? classes.badgeIcon : classes.mainIcon, classes.networkIcon),
                }}
                size={size}
                networkType={selectedNetwork}
            />
            <ProviderIcon
                classes={{
                    icon: classNames(badgeSize > size ? classes.mainIcon : classes.badgeIcon, classes.providerIcon),
                }}
                size={badgeSize}
                providerType={selectedWalletProvider}
            />
        </div>
    )
}
