import { memo, type PropsWithChildren } from 'react'
import { alpha, Box, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import {
    useNetworkContext,
    useNetworkDescriptor,
    useReverseAddress,
    useWeb3Utils,
    useChainContext,
    NetworkContextProvider,
    RevokeChainContextProvider,
} from '@masknet/web3-hooks-base'
import { type NetworkPluginID } from '@masknet/shared-base'
import { useSharedTrans } from '../../../locales/index.js'
import { WalletDescription } from './WalletDescription.js'
import { Action } from './Action.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'content-box',
        display: 'flex',
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 0px 20px rgba(255, 255, 255, 0.12)'
            :   '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        maxHeight: 40,
    },
    connection: {
        width: 18,
        height: 18,
        marginRight: 8,
    },
}))

export interface WalletStatusBarProps<T extends NetworkPluginID> extends PropsWithChildren<{}> {
    className?: string
    actualPluginID?: T
    onClick?: () => void
}

const PluginWalletStatusBarWithoutContext = memo<WalletStatusBarProps<NetworkPluginID>>(
    ({ className, children, onClick }) => {
        const t = useSharedTrans()
        const { classes, cx } = useStyles()

        const { pluginID } = useNetworkContext()
        const { account, chainId } = useChainContext()
        const networkDescriptor = useNetworkDescriptor(pluginID, chainId)
        const { data: domain } = useReverseAddress(pluginID, account)
        const Utils = useWeb3Utils()

        if (!account) {
            return (
                <Box className={cx(classes.root, className)}>
                    <Button fullWidth>
                        <Icons.Wallet className={classes.connection} /> {t.plugin_wallet_connect_a_wallet()}
                    </Button>
                </Box>
            )
        }

        return (
            <Box className={cx(classes.root, className)}>
                <WalletDescription
                    networkIcon={networkDescriptor?.icon}
                    name={domain ?? Utils.formatAddress(account, 4)}
                    formattedAddress={Utils.formatAddress(account, 4)}
                    addressLink={Utils.explorerResolver.addressLink(chainId, account)}
                />
                <Action onClick={onClick}>{children}</Action>
            </Box>
        )
    },
)

PluginWalletStatusBarWithoutContext.displayName = 'PluginWalletStatusBarWithoutContext'

export const PluginWalletStatusBar = memo<WalletStatusBarProps<NetworkPluginID>>((props) => {
    const children = (
        <RevokeChainContextProvider>
            <PluginWalletStatusBarWithoutContext {...props} />
        </RevokeChainContextProvider>
    )

    return props.actualPluginID ?
            <NetworkContextProvider initialNetwork={props.actualPluginID}>{children}</NetworkContextProvider>
        :   children
})

PluginWalletStatusBar.displayName = 'PluginWalletStatusBar'
