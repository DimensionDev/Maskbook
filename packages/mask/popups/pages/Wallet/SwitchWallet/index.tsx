import { Icons } from '@masknet/icons'
import { DashboardRoutes, ECKeyIdentifier, NetworkPluginID, PopupRoutes, type Wallet } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworks, useWallet, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Box, List, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Services from '#services'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { PopupContext } from '../../../hooks/index.js'
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

const SwitchWallet = memo(function SwitchWallet() {
    const t = useMaskSharedTrans()
    const { classes, theme } = useStyles()
    const navigate = useNavigate()
    const { closeModal } = useActionModal()
    const { smartPayChainId } = PopupContext.useContainer()
    const wallet = useWallet()
    const wallets = useWallets()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const handleClickCreate = useCallback(async () => {
        if (!wallets.some((x) => !x.configurable)) {
            const hasPaymentPassword = await Services.Wallet.hasPassword()
            await browser.tabs.create({
                active: true,
                url: browser.runtime.getURL(
                    `/dashboard.html#${
                        hasPaymentPassword ?
                            DashboardRoutes.CreateMaskWalletMnemonic
                        :   DashboardRoutes.CreateMaskWalletForm
                    }`,
                ),
            })
        } else {
            navigate(PopupRoutes.CreateWallet)
        }
    }, [wallets])

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
            await EVMWeb3.connect({
                account: address,
                chainId: wallet.owner && smartPayChainId ? smartPayChainId : chainId,
                providerType: ProviderType.MaskWallet,
                owner: wallet.owner,
                identifier: ECKeyIdentifier.from(wallet.identifier).unwrapOr(undefined),
            })
            closeModal()
            if (wallet.owner && smartPayChainId) {
                const network = networks.find((x) => x.chainId === smartPayChainId)
                if (network) await Network?.switchNetwork(network.ID)
                await EVMWeb3.switchChain?.(smartPayChainId, {
                    providerType: ProviderType.MaskWallet,
                })
            }
        },
        [smartPayChainId, chainId, closeModal, Network, networks],
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
                onClick={handleClickCreate}>
                <Icons.Wallet size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.actionLabel} component="span">
                    {t.popups_add_wallet()}
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
                    {t.popups_import_wallet()}
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
                    {t.popups_lock_wallet()}
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
                    {t.popups_wallet_settings()}
                </Typography>
            </ActionButton>
        </Box>
    )

    return (
        <ActionModal header={t.wallet_account()} action={action}>
            <div className={classes.content}>
                <List dense className={classes.list}>
                    {wallets.map((item) =>
                        item.owner && chainId !== ChainId.Polygon ?
                            null
                        :   <WalletItem
                                key={item.address}
                                wallet={item}
                                onSelect={handleSelect}
                                isSelected={isSameAddress(item.address, wallet?.address)}
                                className={classes.walletItem}
                            />,
                    )}
                </List>
            </div>
        </ActionModal>
    )
})

export default SwitchWallet
