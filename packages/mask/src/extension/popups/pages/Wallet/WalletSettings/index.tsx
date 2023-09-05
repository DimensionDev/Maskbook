import { Icons } from '@masknet/icons'
import { EMPTY_LIST, NetworkPluginID, PopupModalRoutes } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { Box, List, Typography } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useI18N } from '../../../../../utils/index.js'
import { useModalNavigate } from '../../../components/index.js'
import { useTitle } from '../../../hooks/index.js'
import { WalletRemoveModal } from '../../../modals/modals.js'
import { AutoLock } from './AutoLock.js'
import { ChangeCurrency } from './ChangeCurrency.js'
import { ChangeNetwork } from './ChangeNetwork.js'
import { ChangeOwner } from './ChangeOwner.js'
import { ChangePaymentPassword } from './ChangePaymentPassword.js'
import { Contacts } from './Contacts.js'
import { Rename } from './Rename.js'
import { ShowPrivateKey } from './ShowPrivateKey.js'
import { useStyles } from './useStyles.js'
import { ConnectedSites } from './ConnectedSites.js'
import { first, sortBy } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'

const WalletSettings = memo(() => {
    const { t } = useI18N()
    const { classes, cx, theme } = useStyles()
    const modalNavigate = useModalNavigate()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const allWallets = useWallets()

    const handleSwitchWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.WalletAccount)
    }, [modalNavigate])

    useTitle(t('popups_wallet_setting'))
    const wallets = useMemo(() => {
        if (!wallet?.mnemonicId) return EMPTY_LIST
        return sortBy(
            allWallets.filter((x) => x.mnemonicId === wallet.mnemonicId),
            (x) => x.createdAt.getMilliseconds(),
        )
    }, [allWallets, wallet?.mnemonicId])

    if (!wallet) return null

    // The wallet has derivationPath is also the one with minimum derivation path
    const isMinimumDerivationPath = wallet.mnemonicId ? isSameAddress(first(wallets)?.address, wallet.address) : false

    return (
        <div className={classes.content}>
            <Box className={cx(classes.item, classes.primaryItem)} onClick={handleSwitchWallet}>
                <Box className={classes.primaryItemBox}>
                    {wallet.owner ? (
                        <Icons.SmartPay size={24} />
                    ) : (
                        <Icons.MaskBlue size={24} className={classes.maskBlue} />
                    )}
                    <div className={classes.walletInfo}>
                        <Typography className={classes.primaryItemText}>{wallet.name}</Typography>
                        <Typography className={classes.primaryItemSecondText}>{wallet.address}</Typography>
                    </div>
                </Box>
                <Icons.ArrowDownRound color={theme.palette.maskColor.white} size={24} />
            </Box>
            <List dense className={classes.list} data-hide-scrollbar>
                {wallet.owner ? <ChangeOwner /> : null}
                <Rename />
                <Contacts />
                <ConnectedSites />
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
                        disabled={isMinimumDerivationPath}
                        onClick={async () =>
                            await WalletRemoveModal.openAndWaitForClose({
                                title: t('remove'),
                                wallet,
                            })
                        }
                        width={368}
                        color="error"
                        className={classes.removeWalletButton}>
                        {t('popups_wallet_settings_remove_wallet')}
                    </ActionButton>
                </Box>
            )}
        </div>
    )
})

export default WalletSettings
