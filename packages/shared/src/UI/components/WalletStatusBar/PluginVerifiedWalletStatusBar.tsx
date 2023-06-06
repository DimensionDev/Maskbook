import { memo, type PropsWithChildren, useCallback, useMemo, useState, useEffect } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { first, omit } from 'lodash-es'
import { WalletMessages } from '@masknet/plugin-wallet'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { SmartPayBundler } from '@masknet/web3-providers'
import { isSameAddress, resolveNextID_NetworkPluginID, TransactionStatusType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { alpha, Box, Button, Divider, MenuItem, Typography } from '@mui/material'
import { type BindingProof, type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import {
    useChainContext,
    useNetworkContext,
    useNetworkDescriptor,
    useProviderDescriptor,
    useDefaultChainId,
    useRecentTransactions,
    useWallets,
    useAccount,
    useChainId,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { useSharedI18N } from '../../../locales/index.js'
import { Action } from './Action.js'
import type { WalletDescriptionProps } from './WalletDescription.js'
import { useWalletName } from './hooks/useWalletName.js'
import { WalletDescription } from './WalletDescription.js'
import { WalletMenuItem } from './WalletMenuItem.js'
import { useMenuConfig } from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'content-box',
        display: 'flex',
        backgroundColor: Sniffings.is_dashboard_page
            ? MaskColorVar.mainBackground
            : alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : '0px 0px 20px rgba(0, 0, 0, 0.05)',
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
    menu: {
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 4px 30px rgba(255, 255, 255, 0.15)'
                : '0px 4px 30px rgba(0, 0, 0, 0.1)',
    },
}))

interface PluginVerifiedWalletStatusBarProps extends PropsWithChildren<{}> {
    verifiedWallets: BindingProof[]
    className?: string
    expectedAddress: string
    openPopupWindow: () => void
    onChange?: (address: string, pluginID: NetworkPluginID, chainId: Web3Helper.ChainIdAll) => void
}

export const PluginVerifiedWalletStatusBar = memo<PluginVerifiedWalletStatusBarProps>(
    ({ className, children, verifiedWallets, onChange, expectedAddress, openPopupWindow }) => {
        const t = useSharedI18N()
        const { classes, cx } = useStyles()

        const account = useAccount()
        const globalChainId = useChainId()
        const { chainId } = useChainContext()
        const allWallets = useWallets()
        const { pluginID: currentPluginID } = useNetworkContext()
        const isSmartPay = !!allWallets.find((x) => isSameAddress(x.address, account) && x.owner)
        const { value: smartPaySupportChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

        const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
            WalletMessages.events.selectProviderDialogUpdated,
        )

        const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
            WalletMessages.events.walletStatusDialogUpdated,
        )

        useEffect(() => {
            onChange?.(account, currentPluginID, globalChainId)
        }, [onChange, account, currentPluginID, globalChainId])

        // exclude current account
        const wallets = verifiedWallets.filter((x) => !isSameAddress(x.identity, account))

        const selectedWallet = wallets.find((x) => isSameAddress(x.identity, expectedAddress))

        const defaultVerifiedWallet = selectedWallet ?? first(wallets)

        // Whether the current account is verified
        const isVerifiedAccount = verifiedWallets.some((x) => isSameAddress(x.identity, account))

        const pluginIdByDefaultVerifiedWallet = defaultVerifiedWallet
            ? resolveNextID_NetworkPluginID(defaultVerifiedWallet?.platform)
            : undefined

        const isNextIdWallet = !account || !isSameAddress(account, expectedAddress)

        const defaultPluginId = isNextIdWallet ? pluginIdByDefaultVerifiedWallet : currentPluginID

        const defaultWalletName = useWalletName(
            isNextIdWallet ? defaultVerifiedWallet?.identity : account,
            defaultPluginId,
            isNextIdWallet,
        )

        const Others = useWeb3Others(defaultPluginId)
        const defaultChainId = useDefaultChainId(defaultPluginId)

        const providerDescriptor = useProviderDescriptor(defaultPluginId)
        const networkDescriptor = useNetworkDescriptor(
            defaultPluginId,
            !isNextIdWallet ? globalChainId : defaultChainId,
        )

        const pendingTransactions = useRecentTransactions(currentPluginID, TransactionStatusType.NOT_DEPEND)

        // actual address
        const walletIdentity = !isNextIdWallet ? account : defaultVerifiedWallet?.identity

        const description = useMemo(
            () => ({
                name: defaultWalletName,
                networkIcon: networkDescriptor?.icon,
                providerIcon: !isNextIdWallet ? providerDescriptor?.icon : undefined,
                iconFilterColor: !isNextIdWallet ? providerDescriptor?.iconFilterColor : '',
                formattedAddress: walletIdentity ? Others.formatAddress(walletIdentity, 4) : '',
                addressLink: walletIdentity
                    ? Others.explorerResolver.addressLink(!isNextIdWallet ? chainId : defaultChainId, walletIdentity)
                    : '',
                address: walletIdentity,
                verified: !isNextIdWallet ? isVerifiedAccount : true,
            }),
            [
                account,
                defaultWalletName,
                providerDescriptor,
                networkDescriptor,
                defaultVerifiedWallet,
                defaultChainId,
                chainId,
                walletIdentity,
            ],
        )

        const [descriptionProps, setDescriptionProps] = useState<WalletDescriptionProps>(description)

        const onSelect = useCallback(
            (props: WalletDescriptionProps, chainId: Web3Helper.ChainIdAll, pluginID: NetworkPluginID) => {
                setDescriptionProps(props)

                if (!props.address) return

                onChange?.(props.address, pluginID, chainId)
            },
            [setDescriptionProps, onChange],
        )

        const [menu, openMenu] = useMenuConfig(
            [
                account ? (
                    <WalletMenuItem
                        address={account}
                        verified={isVerifiedAccount}
                        onChangeWallet={openSelectProviderDialog}
                        selected={isSameAddress(descriptionProps.address, account)}
                        onSelect={onSelect}
                        expectedChainId={isSmartPay ? smartPaySupportChainId : globalChainId}
                    />
                ) : (
                    <MenuItem key="connect">
                        <Button
                            variant="roundedContained"
                            fullWidth
                            onClick={openSelectProviderDialog}
                            sx={{ minWidth: 311 }}>
                            {t.connect_your_wallet()}
                        </Button>
                    </MenuItem>
                ),
                <Divider key="divider" style={{ marginLeft: 8, marginRight: 8 }} />,
                ...wallets.map((x) => (
                    <WalletMenuItem
                        key={x.identity}
                        address={x.identity}
                        verified
                        platform={x.platform}
                        selected={isSameAddress(descriptionProps.address, x.identity)}
                        onSelect={onSelect}
                    />
                )),
                <MenuItem key="Wallet Setting" onClick={openPopupWindow}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Icons.WalletSetting size={30} sx={{ marginRight: 1, transform: 'translate(0px, 2px)' }} />
                        <Typography fontSize={14} fontWeight={700}>
                            {t.connected_wallet_settings()}
                        </Typography>
                    </Box>
                </MenuItem>,
            ],
            {
                classes: { paper: classes.menu },
            },
        )

        useUpdateEffect(() => {
            setDescriptionProps(description)
        }, [description])

        if (!account && verifiedWallets.length === 0) {
            return (
                <Box className={cx(classes.root, className)}>
                    <Button fullWidth onClick={openSelectProviderDialog}>
                        <Icons.ConnectWallet className={classes.connection} /> {t.plugin_wallet_connect_a_wallet()}
                    </Button>
                </Box>
            )
        }

        return (
            <>
                <Box className={cx(classes.root, className)}>
                    <WalletDescription
                        {...omit(descriptionProps, 'address')}
                        onClick={openMenu}
                        pending={!!pendingTransactions.length}
                        onPendingClick={openWalletStatusDialog}
                    />
                    <Action openSelectWalletDialog={openSelectProviderDialog}>{children}</Action>
                </Box>
                {menu}
            </>
        )
    },
)
