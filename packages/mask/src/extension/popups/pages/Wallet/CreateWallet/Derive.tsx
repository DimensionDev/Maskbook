import { defer, timeout } from '@masknet/kit'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useWallet, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { Providers, Web3 } from '@masknet/web3-providers'
import { generateNewWalletName, isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, List, ListItem, Tooltip, Typography } from '@mui/material'
import { memo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import Services from '#services'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hooks/index.js'
import { useWalletGroup } from '../../../hooks/useWalletGroup.js'
import { Icons } from '@masknet/icons'
import { WalletBalance } from '../../../components/index.js'
import { WalletRenameModal } from '../../../modals/index.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    list: {
        flexGrow: 1,
        overflow: 'auto',
    },
    wallet: {
        padding: theme.spacing(1),
        borderRadius: 8,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
        position: 'relative',
        paddingLeft: 44,
        marginBottom: theme.spacing(2),
    },
    indicator: {
        position: 'absolute',
        left: 8,
        top: 0,
        bottom: 0,
        margin: 'auto',
    },
    walletName: {
        fontWeight: 700,
        fontSize: 12,
    },
    walletAddress: {
        fontWeight: 400,
        fontSize: 12,
    },
    balance: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.palette.maskColor.second,
    },
    editButton: {
        cursor: 'pointer',
        marginLeft: theme.spacing(2),
    },
}))

async function pollResult(address: string) {
    const subscription = Providers[ProviderType.MaskWallet].subscription.wallets
    if (subscription.getCurrentValue().find((x) => isSameAddress(x.address, address))) return
    const [promise, resolve] = defer()
    const unsubscribe = subscription.subscribe(() => {
        if (subscription.getCurrentValue().find((x) => isSameAddress(x.address, address))) resolve(true)
    })
    return timeout(promise, 10_000, 'It takes too long to create a wallet. You might try again.').finally(unsubscribe)
}

const DeriveWallet = memo(function DeriveWallet() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const mnemonicId = useLocation().state?.mnemonicId as string

    const walletGroup = useWalletGroup()
    const wallets = walletGroup?.groups[mnemonicId] ?? EMPTY_LIST
    const allWallets = useWallets()

    const currentWallet = useWallet()

    const { NameService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const [{ loading }, create] = useAsyncFn(async () => {
        try {
            const nextWallet = await Services.Wallet.generateNextDerivationAddress()
            const ens = await NameService?.reverse?.(nextWallet)
            const name = ens || generateNewWalletName(allWallets)
            const address = await Services.Wallet.deriveWallet(name, mnemonicId)
            await pollResult(address)
            await Web3.connect({
                providerType: ProviderType.MaskWallet,
                account: address,
            })
        } catch {}
    }, [allWallets, mnemonicId])

    useTitle(t('popups_add_wallet'))

    return (
        <div className={classes.content}>
            <List dense className={classes.list}>
                {wallets.map((wallet) => (
                    <ListItem key={wallet.address} className={classes.wallet}>
                        {isSameAddress(wallet.address, currentWallet?.address) ? (
                            <Icons.CheckCircle className={classes.indicator} size={20} />
                        ) : null}
                        <Icons.MaskBlue size={24} />
                        <Box flexGrow={1} ml={1}>
                            <Typography className={classes.walletName}>{wallet.name}</Typography>
                            <Box display="flex" flexDirection="row">
                                <Tooltip title={wallet.address} className={classes.walletAddress}>
                                    <Typography mr="auto">{formatEthereumAddress(wallet.address, 4)}</Typography>
                                </Tooltip>
                                <WalletBalance
                                    className={classes.balance}
                                    skeletonWidth={60}
                                    account={wallet.address}
                                />
                            </Box>
                        </Box>
                        <Icons.Edit2
                            size={20}
                            className={classes.editButton}
                            onClick={() => {
                                WalletRenameModal.open({
                                    wallet,
                                    title: t('rename'),
                                })
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <ActionButton loading={loading} fullWidth disabled={loading} onClick={create}>
                {t('add')}
            </ActionButton>
        </div>
    )
})

export default DeriveWallet
