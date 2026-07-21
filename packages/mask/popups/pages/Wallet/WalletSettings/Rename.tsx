import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { PersistentStorages } from '@masknet/shared-base'
import { useFireflyEmbeddedWallets, useWallet } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Box, ListItem, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { WalletRenameModal } from '../../../modals/modal-controls.js'
import { useStyles } from './useStyles.js'

export const Rename = function Rename() {
    const wallet = useWallet()
    const { classes, theme } = useStyles()
    const { wallets: fireflyWallets } = useFireflyEmbeddedWallets()
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
                <Icons.Edit2 size={20} color={theme.vars.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    <Trans>Rename</Trans>
                </Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={classes.itemText}>{walletName}</Typography>
                <Icons.ArrowRight color={theme.vars.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
