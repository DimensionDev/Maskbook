import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { PersistentStorages, PrivyEnvGuard } from '@masknet/shared-base'
import { useWallet } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Box, ListItem, Typography } from '@mui/material'
import { useWallets } from '@privy-io/react-auth'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { WalletRenameModal } from '../../../modals/modal-controls.js'
import { useStyles } from './useStyles.js'

export const Rename = PrivyEnvGuard(function Rename() {
    const wallet = useWallet()
    const { classes, theme } = useStyles()
    const { wallets: fireflyWallets } = useWallets()
    const isFireflyWallet = useMemo(
        () => fireflyWallets.some((w) => isSameAddress(w.address, wallet?.address)),
        [fireflyWallets, wallet?.address],
    )
    const fireflyAccount = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)

    if (!wallet) return null

    const walletName = wallet.name || (isFireflyWallet ? fireflyAccount.displayName : wallet.name)
    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                WalletRenameModal.open({
                    wallet,
                    walletName,
                    title: <Trans>Rename</Trans>,
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.Edit2 size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    <Trans>Rename</Trans>
                </Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={classes.itemText}>{walletName}</Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
})
