import { NetworkIcon, ProviderIcon, useValueRef } from '@masknet/shared'
import { ProviderType } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { currentNetworkSettings, currentProviderSettings } from '../../plugins/Wallet/settings'

interface StyleProps {
    selectedWalletProvider: ProviderType
}

const useStyles = makeStyles<StyleProps>()((_theme, props) => ({
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
        ...(props.selectedWalletProvider === ProviderType.FortMatic ? { transform: 'scale(0.9)' } : {}),
    },
}))

interface WalletIconProps {
    size?: number
    badgeSize?: number
}

export const WalletIcon = ({ size = 24, badgeSize = 14 }: WalletIconProps) => {
    const selectedNetwork = useValueRef(currentNetworkSettings)
    const selectedWalletProvider = useValueRef(currentProviderSettings)
    const { classes } = useStyles({ selectedWalletProvider })
    return (
        <div
            className={classes.root}
            style={{
                height: size,
                width: size,
            }}>
            <NetworkIcon classes={{ icon: classes.mainIcon }} size={size} networkType={selectedNetwork} />
            <ProviderIcon
                classes={{ icon: classes.badgeIcon }}
                size={badgeSize}
                providerType={selectedWalletProvider}
            />
        </div>
    )
}
