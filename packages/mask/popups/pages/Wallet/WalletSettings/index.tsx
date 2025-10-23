import { Icons } from '@masknet/icons'
import { EMPTY_LIST, PopupModalRoutes } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Box, List, Typography } from '@mui/material'
import { first } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useModalNavigate } from '../../../components/index.js'
import { useTitle } from '../../../hooks/index.js'
import { WalletRemoveModal } from '../../../modals/modal-controls.js'
import { AutoLock } from './AutoLock.js'
import { ChangeCurrency } from './ChangeCurrency.js'
import { ChangeNetwork } from './ChangeNetwork.js'
import { ChangePaymentPassword } from './ChangePaymentPassword.js'
import { ConnectedOrigins } from './ConnectedOrigins.js'
import { Contacts } from './Contacts.js'
import { Rename } from './Rename.js'
import { ShowPrivateKey } from './ShowPrivateKey.js'
import { useStyles } from './useStyles.js'
import { HidingScamTx } from './HidingScamTx.js'
import { Trans, useLingui } from '@lingui/react/macro'
import { DisablePermit } from './DisablePermit.js'

function getPathIndex(path?: string) {
    const rawIndex = path?.split('/').pop()
    if (!rawIndex) return
    return Number.parseInt(rawIndex, 10)
}
export const Component = memo(function WalletSettings() {
    const { t } = useLingui()
    const { classes, cx, theme } = useStyles()
    const modalNavigate = useModalNavigate()
    const wallet = useWallet()
    const allWallets = useWallets()

    const handleSwitchWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.WalletAccount)
    }, [modalNavigate])

    useTitle(t`Wallet Settings`)
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
                    <Icons.MaskBlue size={24} className={classes.maskBlue} />
                    <div className={classes.walletInfo}>
                        <Typography className={classes.primaryItemText}>{wallet.name}</Typography>
                        <Typography className={classes.primaryItemSecondText}>{wallet.address}</Typography>
                    </div>
                </Box>
                <Icons.ArrowDownRound color={theme.palette.maskColor.white} size={24} />
            </Box>
            <List dense className={classes.list} data-hide-scrollbar>
                <Rename />
                <Contacts />
                <HidingScamTx />
                <DisablePermit />
                <ConnectedOrigins />
                <AutoLock />
                <ChangeCurrency />
                <ChangePaymentPassword />
                <ShowPrivateKey />
                <ChangeNetwork />
            </List>
            <Box className={classes.bottomAction}>
                <ActionButton
                    fullWidth
                    disabled={isTheFirstWallet}
                    onClick={async () => {
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
        </div>
    )
})
