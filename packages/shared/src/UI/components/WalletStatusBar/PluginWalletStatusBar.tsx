import { memo, type PropsWithChildren, useCallback, useMemo } from 'react'
import { Box, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import { alpha, makeStyles } from '@masknet/theme'
import {
    useNetworkContext,
    useProviderDescriptor,
    useRecentTransactions,
    useNetworkDescriptor,
    useReverseAddress,
    useWeb3Utils,
    useChainContext,
    NetworkContextProvider,
    RevokeChainContextProvider,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { WalletDescription } from './WalletDescription.js'
import { Action } from './Action.js'
import { SelectProviderModal, WalletStatusModal } from '../../../index.js'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'content-box',
        display: 'flex',
        backgroundColor:
            Sniffings.is_dashboard_page ?
                theme.vars.palette.background.mainBackground
            :   alpha(theme.vars.palette.maskColor.bottom, 0.8),
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        ...theme.applyStyles('dark', { boxShadow: '0px 0px 20px rgba(255, 255, 255, 0.12)' }),
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

export interface PluginWalletStatusBarWithoutContextProps<T extends NetworkPluginID> extends PropsWithChildren {
    className?: string
    expectedPluginID?: T
    expectedChainId?: Web3Helper.Definition[T]['ChainId']
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
    requiredSupportChainIds?: Array<Web3Helper.Definition[T]['ChainId']>
    requiredSupportPluginID?: NetworkPluginID
    readonlyMode?: boolean
    disableSwitchAccount?: boolean
    /** Hide pending indicator, defaults to false */
    disablePending?: boolean
}

export interface PluginWalletStatusBarProps<T extends NetworkPluginID>
    extends PropsWithChildren,
        PluginWalletStatusBarWithoutContextProps<T> {
    actualPluginID?: T
}

const PluginWalletStatusBarWithoutContext = memo<PluginWalletStatusBarWithoutContextProps<NetworkPluginID>>(
    ({
        className,
        onClick,
        expectedPluginID,
        expectedChainId,
        children,
        requiredSupportChainIds,
        requiredSupportPluginID,
        readonlyMode,
        disableSwitchAccount,
        disablePending,
    }) => {
        const { classes, cx } = useStyles()

        const { pluginID } = useNetworkContext()
        const { account, chainId } = useChainContext()
        const providerDescriptor = useProviderDescriptor()
        const networkDescriptor = useNetworkDescriptor(pluginID, chainId)
        const expectedNetworkDescriptor = useNetworkDescriptor(expectedPluginID, expectedChainId)
        const { data: domain } = useReverseAddress(pluginID, account)
        const Utils = useWeb3Utils()

        const openSelectProviderDialog = useCallback(() => {
            SelectProviderModal.open({
                requiredSupportChainIds,
                requiredSupportPluginID,
            })
        }, [expectedNetworkDescriptor, requiredSupportChainIds, requiredSupportPluginID])

        const pendingTransactions = useRecentTransactions(pluginID, TransactionStatusType.NOT_DEPEND)

        const walletName = useMemo(() => {
            if (domain) return domain
            return providerDescriptor?.name || Utils.formatAddress(account, 4)
        }, [account, domain, providerDescriptor?.name, Utils.formatAddress])

        if (!account) {
            return (
                <Box className={cx(classes.root, className)}>
                    <Button fullWidth onClick={openSelectProviderDialog}>
                        <Icons.Wallet className={classes.connection} /> <Trans>Connect Wallet</Trans>
                    </Button>
                </Box>
            )
        }

        return (
            <Box className={cx(classes.root, className)}>
                <WalletDescription
                    pending={disablePending ? false : !!pendingTransactions.length}
                    providerIcon={providerDescriptor?.icon}
                    networkIcon={networkDescriptor?.icon}
                    iconFilterColor={providerDescriptor?.iconFilterColor}
                    name={walletName}
                    formattedAddress={Utils.formatAddress(account, 4)}
                    addressLink={Utils.explorerResolver.addressLink(chainId, account)}
                    onClick={readonlyMode || disableSwitchAccount ? undefined : (onClick ?? openSelectProviderDialog)}
                    onPendingClick={readonlyMode || disableSwitchAccount ? undefined : () => WalletStatusModal.open()}
                />
                {readonlyMode ? null : <Action openSelectWalletDialog={openSelectProviderDialog}>{children}</Action>}
            </Box>
        )
    },
)

PluginWalletStatusBarWithoutContext.displayName = 'PluginWalletStatusBarWithoutContext'

export const PluginWalletStatusBar = memo<PluginWalletStatusBarProps<NetworkPluginID>>((props) => {
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
