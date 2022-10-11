import { memo, PropsWithChildren, useCallback, useMemo } from 'react'
import { Box, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import {
    useCurrentWeb3NetworkPluginID,
    useProviderDescriptor,
    useRecentTransactions,
    useNetworkDescriptor,
    useWallet,
    useReverseAddress,
    useWeb3State,
    useProviderType,
    useChainId,
    useAccount,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { NetworkPluginID } from '@masknet/shared-base'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { useI18N } from '../../i18n-next-ui.js'
import { ProviderType } from '@masknet/web3-shared-evm'
import { WalletDescription } from './WalletDescription.js'
import { Action } from './Action.js'
import { useStatusBarStyles } from './styles.js'

export interface WalletStatusBarProps<T extends NetworkPluginID> extends PropsWithChildren<{}> {
    className?: string
    expectedPluginID?: T
    expectedChainId?: Web3Helper.Definition[T]['ChainId']
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
}

export const PluginWalletStatusBar = memo<WalletStatusBarProps<NetworkPluginID>>(
    ({ className, onClick, expectedPluginID, expectedChainId, children }) => {
        const { t } = useI18N()
        const { classes, cx } = useStatusBarStyles()

        const pluginID = useCurrentWeb3NetworkPluginID()
        const account = useAccount(pluginID)
        const wallet = useWallet(pluginID)
        const chainId = useChainId(pluginID)
        const providerDescriptor = useProviderDescriptor()
        const providerType = useProviderType()
        const networkDescriptor = useNetworkDescriptor(pluginID, chainId)
        const expectedNetworkDescriptor = useNetworkDescriptor(expectedPluginID, expectedChainId)
        const { value: domain } = useReverseAddress(pluginID, account)
        const { Others } = useWeb3State()

        const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
            WalletMessages.events.selectProviderDialogUpdated,
        )

        const openSelectProviderDialog = useCallback(() => {
            setSelectProviderDialog({
                open: true,
                network: expectedNetworkDescriptor,
            })
        }, [expectedNetworkDescriptor])

        const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
            WalletMessages.events.walletStatusDialogUpdated,
        )

        const pendingTransactions = useRecentTransactions(pluginID, TransactionStatusType.NOT_DEPEND)

        const walletName = useMemo(() => {
            if (domain) return domain
            if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name
            return providerDescriptor?.name || Others?.formatAddress(account, 4)
        }, [account, domain, providerType, wallet?.name, providerDescriptor?.name, Others?.formatAddress])

        if (!account) {
            return (
                <Box className={cx(classes.root, className)}>
                    <Button fullWidth onClick={openSelectProviderDialog}>
                        <Icons.ConnectWallet className={classes.connection} /> {t('plugin_wallet_connect_a_wallet')}
                    </Button>
                </Box>
            )
        }

        return (
            <Box className={cx(classes.root, className)}>
                <WalletDescription
                    pending={!!pendingTransactions.length}
                    providerIcon={providerDescriptor?.icon}
                    networkIcon={networkDescriptor?.icon}
                    iconFilterColor={providerDescriptor?.iconFilterColor}
                    name={walletName}
                    formattedAddress={Others?.formatAddress(account, 4)}
                    addressLink={Others?.explorerResolver.addressLink?.(chainId, account)}
                    onClick={onClick ?? openSelectProviderDialog}
                    onPendingClick={openWalletStatusDialog}
                />
                <Action openSelectWalletDialog={openSelectProviderDialog}>{children}</Action>
            </Box>
        )
    },
)
