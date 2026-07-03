import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import {
    DashboardRoutes,
    ECKeyIdentifier,
    NetworkPluginID,
    PopupRoutes,
    PrivyEnvGuard,
    type Wallet,
} from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import {
    useChainContext,
    useFireflyEmbeddedWallets,
    useNetworks,
    useWallet,
    useWallets,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import { EVMWeb3, PRIVY_SUPPORTED_CHAINS } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Box, List, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionModal, useActionModal } from '../../../components/index.js'
import { WalletItem } from '../../../components/WalletItem/index.js'
const useStyles = makeStyles()((theme) => ({
    content: {
        overflow: 'auto',
        backgroundColor: theme.palette.maskColor.bottom,
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        padding: 0,
        overflow: 'auto',
    },
    walletItem: {
        marginBottom: 6,
    },
    modalAction: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing(2, 1),
    },
    actionButton: {
        display: 'flex',
        justifyContent: 'flex-start',
    },
    actionLabel: {
        marginLeft: theme.spacing(0.5),
    },
}))

const SwitchWallet = memo(
    PrivyEnvGuard(function SwitchWallet() {
        const { classes, theme } = useStyles()
        const navigate = useNavigate()
        const { closeModal } = useActionModal()
        const wallet = useWallet()
        const wallets = useWallets()
        const { wallets: privyWallets } = useFireflyEmbeddedWallets()
        const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

        const handleImport = useCallback(async () => {
            await browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/dashboard.html#' + DashboardRoutes.RecoveryMaskWallet),
            })
        }, [])

        const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
        const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
        const handleSelect = useCallback(
            async (wallet: Wallet) => {
                const address = wallet.address
                const isPrivyWallet = privyWallets.some((x) => isSameAddress(x.address, address))
                await EVMWeb3.connect({
                    account: address,
                    chainId: isPrivyWallet && !PRIVY_SUPPORTED_CHAINS.includes(chainId) ? ChainId.Mainnet : chainId,
                    providerType: ProviderType.MaskWallet,

                    identifier: ECKeyIdentifier.from(wallet.identifier).unwrapOr(undefined),
                })
                closeModal()
            },
            [chainId, closeModal, Network, networks],
        )

        const handleClickSettings = useCallback(async () => {
            navigate(PopupRoutes.WalletSettings)
        }, [])

        const handleLock = useCallback(async () => {
            await Services.Wallet.lockWallet()
            navigate(PopupRoutes.Wallet)
        }, [])

        const action = (
            <Box className={classes.modalAction}>
                <ActionButton
                    className={classes.actionButton}
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        navigate(PopupRoutes.CreateWallet)
                    }}>
                    <Icons.Wallet size={20} color={theme.palette.maskColor.second} />
                    <Typography className={classes.actionLabel} component="span">
                        <Trans>Add Wallet</Trans>
                    </Typography>
                </ActionButton>
                <ActionButton
                    className={classes.actionButton}
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={handleImport}>
                    <Icons.Download2 size={20} color={theme.palette.maskColor.second} />
                    <Typography className={classes.actionLabel} component="span">
                        <Trans>Import Wallet</Trans>
                    </Typography>
                </ActionButton>
                <ActionButton
                    className={classes.actionButton}
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={handleLock}>
                    <Icons.Lock size={20} color={theme.palette.maskColor.second} />
                    <Typography className={classes.actionLabel} component="span">
                        <Trans>Lock Wallet</Trans>
                    </Typography>
                </ActionButton>
                <ActionButton
                    className={classes.actionButton}
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={handleClickSettings}>
                    <Icons.WalletSetting size={20} color={theme.palette.maskColor.second} />
                    <Typography className={classes.actionLabel} component="span">
                        <Trans>Wallet Settings</Trans>
                    </Typography>
                </ActionButton>
            </Box>
        )

        return (
            <ActionModal header={<Trans>Wallet Account</Trans>} action={action}>
                <div className={classes.content}>
                    <List dense className={classes.list}>
                        {wallets.map((item) => (
                            <WalletItem
                                key={item.address}
                                wallet={item}
                                onSelect={handleSelect}
                                isSelected={isSameAddress(item.address, wallet?.address)}
                                className={classes.walletItem}
                            />
                        ))}
                    </List>
                </div>
            </ActionModal>
        )
    }),
)

export default SwitchWallet
