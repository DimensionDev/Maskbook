import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { Box, List, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { Rename } from './Rename.js'
import { Contacts } from './Contacts.js'
import { useStyles } from './useStyles.js'
import { AutoLock } from './AutoLock.js'
import { ChangePaymentPassword } from './ChangePaymentPassword.js'
import { ShowPrivateKey } from './ShowPrivateKey.js'
import { ChangeNetwork } from './ChangeNetwork.js'
import { ChangeCurrency } from './ChangeCurrency.js'
import { ChangeOwner } from './ChangeOwner.js'
import { ActionButton } from '@masknet/theme'
import { WalletRemoveModal } from '../../../modals/modals.js'

const WalletSettings = memo(() => {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const theme = useTheme()

    useTitle(t('popups_wallet_setting'))

    if (!wallet) return null

    return (
        <div className={classes.content}>
            <Box className={cx(classes.item, classes.primaryItem)}>
                <Box className={classes.primaryItemBox}>
                    {wallet.owner ? (
                        <Icons.SmartPay size={24} />
                    ) : (
                        <Icons.MaskBlue size={24} className={classes.maskBlue} />
                    )}
                    <div className={classes.walletInfo}>
                        <Typography className={classes.primaryItemText}>{wallet.name}</Typography>
                        <Typography className={classes.primaryItemSecondeText}>{wallet.address}</Typography>
                    </div>
                </Box>
                <Icons.ArrowDownRound color={theme.palette.maskColor.white} size={24} />
            </Box>
            <List dense className={classes.list}>
                {wallet.owner ? <ChangeOwner /> : null}
                <Rename />
                <Contacts />
                <AutoLock />
                <ChangeCurrency />
                <ChangePaymentPassword />
                <ShowPrivateKey />
                <ChangeNetwork />
            </List>
            <Box className={classes.bottomAction}>
                <ActionButton
                    fullWidth
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
        </div>
    )
})

export default WalletSettings
