import { Icons } from '@masknet/icons'
import { useWallet } from '@masknet/web3-hooks-base'
import { Box, ListItem, Typography } from '@mui/material'
import { useStyles } from './useStyles.js'
import { WalletRenameModal } from '../../../modals/modal-controls.js'
import { Trans } from '@lingui/react/macro'
import { useWallets } from '@privy-io/react-auth'
import { useMemo } from 'react'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useSubscription } from 'use-subscription'
import { PersistentStorages } from '@masknet/shared-base'

export function Rename() {
    const wallet = useWallet()
    const { classes, theme } = useStyles()
    const { wallets: fireflyWallets } = useWallets()
    const isFireflyWallet = useMemo(
        () => fireflyWallets.some((w) => isSameAddress(w.address, wallet?.address)),
        [fireflyWallets, wallet?.address],
    )
    const fireflyAccount = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)

    if (!wallet) return null

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                WalletRenameModal.open({
                    wallet,
                    walletName: wallet.name || (isFireflyWallet ? fireflyAccount.displayName : wallet.name),
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
                <Typography className={classes.itemText}>
                    {isFireflyWallet ? fireflyAccount.displayName : wallet.name}
                </Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
