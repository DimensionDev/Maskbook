import { Icons } from '@masknet/icons'
import { ConfirmDialog } from '@masknet/shared'
import { EMPTY_LIST, PopupModalRoutes } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, List, Typography } from '@mui/material'
import { first } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { MaskSharedTrans } from '../../../../shared-ui/index.js'
import { useModalNavigate } from '../../../components/index.js'
import { useTitle } from '../../../hooks/index.js'
import { WalletRemoveModal } from '../../../modals/modal-controls.js'
import { AutoLock } from './AutoLock.js'
import { ChangeCurrency } from './ChangeCurrency.js'
import { ChangeNetwork } from './ChangeNetwork.js'
import { ChangeOwner } from './ChangeOwner.js'
import { ChangePaymentPassword } from './ChangePaymentPassword.js'
import { ConnectedOrigins } from './ConnectedOrigins.js'
import { Contacts } from './Contacts.js'
import { Rename } from './Rename.js'
import { ShowPrivateKey } from './ShowPrivateKey.js'
import { useStyles } from './useStyles.js'
import { HidingScamTx } from './HidingScamTx.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

function getPathIndex(path?: string) {
    const rawIndex = path?.split('/').pop()
    if (!rawIndex) return
    return Number.parseInt(rawIndex, 10)
}
export const Component = memo(function WalletSettings() {
    const { _ } = useLingui()
    const { classes, cx, theme } = useStyles()
    const modalNavigate = useModalNavigate()
    const wallet = useWallet()
    const allWallets = useWallets()

    const handleSwitchWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.WalletAccount)
    }, [modalNavigate])

    useTitle(_(msg`Wallet Settings`))
    const siblingWallets = useMemo(() => {
        if (!wallet?.mnemonicId) return EMPTY_LIST
        return allWallets
            .filter((x) => x.mnemonicId === wallet.mnemonicId)
            .sort((a, z) => {
                const msA = a.createdAt.getTime()
                const msZ = z.createdAt.getTime()
                if (msA !== msZ) return msA - msZ
                const pathIndexA = getPathIndex(a.derivationPath)
                const pathIndexZ = getPathIndex(z.derivationPath)
                if (pathIndexA === pathIndexZ) return 0
                if (pathIndexA === undefined) return 1
                if (pathIndexZ === undefined) return -1
                return pathIndexA - pathIndexZ
            })
    }, [allWallets, wallet?.mnemonicId])

    if (!wallet) return null

    // The wallet has derivationPath is also the one with minimum derivation path
    const isTheFirstWallet = wallet.mnemonicId ? isSameAddress(first(siblingWallets)?.address, wallet.address) : false

    return (
        <div className={classes.content}>
            <Box className={cx(classes.item, classes.primaryItem)} onClick={handleSwitchWallet}>
                <Box className={classes.primaryItemBox}>
                    {wallet.owner ?
                        <Icons.SmartPay size={24} />
                    :   <Icons.MaskBlue size={24} className={classes.maskBlue} />}
                    <div className={classes.walletInfo}>
                        <Typography className={classes.primaryItemText}>{wallet.name}</Typography>
                        <Typography className={classes.primaryItemSecondText}>{wallet.address}</Typography>
                    </div>
                </Box>
                <Icons.ArrowDownRound color={theme.palette.maskColor.white} size={24} />
            </Box>
            <List dense className={classes.list} data-hide-scrollbar>
                {wallet.owner ?
                    <ChangeOwner />
                :   null}
                <Rename />
                <Contacts />
                <HidingScamTx />
                <ConnectedOrigins />
                <AutoLock />
                <ChangeCurrency />
                <ChangePaymentPassword />
                {wallet.owner ? null : (
                    <>
                        <ShowPrivateKey />
                        <ChangeNetwork />
                    </>
                )}
            </List>
            {wallet.owner ? null : (
                <Box className={classes.bottomAction}>
                    <ActionButton
                        fullWidth
                        disabled={isTheFirstWallet}
                        onClick={async () => {
                            const ownedWallets =
                                !wallet?.address ? [] : allWallets.filter((x) => isSameAddress(x.owner, wallet.address))
                            if (ownedWallets.length) {
                                const currentWallet = formatEthereumAddress(wallet.address, 4)
                                const other_wallets = ownedWallets
                                    .map((x) => formatEthereumAddress(x.address, 4))
                                    .join(',')
                                const confirmed = await ConfirmDialog.openAndWaitForClose({
                                    title: <Trans>Remove Wallet?</Trans>,
                                    message: (
                                        <Typography className={classes.confirmMessage}>
                                            {/* eslint-disable-next-line react/naming-convention/component-name */}
                                            <MaskSharedTrans.remove_wallet_message
                                                values={{
                                                    wallet: currentWallet,
                                                    other_wallets,
                                                }}
                                                components={{
                                                    bold: <Typography className={classes.bold} component="span" />,
                                                    br: <br />,
                                                }}
                                            />
                                        </Typography>
                                    ),
                                })
                                if (!confirmed) return
                            }
                            await WalletRemoveModal.openAndWaitForClose({
                                title: <Trans>Remove</Trans>,
                                wallet,
                            })
                        }}
                        width={368}
                        color="error"
                        className={classes.removeWalletButton}>
                        <Trans>Remove Wallet</Trans>
                    </ActionButton>
                </Box>
            )}
        </div>
    )
})
