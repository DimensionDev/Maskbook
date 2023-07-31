import { Icons } from '@masknet/icons'
import { type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { Box, List, ListItem, Typography, useTheme } from '@mui/material'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { Rename } from './Rename.js'
import { Contacts } from './Contacts.js'
import { useStyles } from './useStyles.js'
import { AutoLock } from './AutoLock.js'
import { ChangePaymentPassword } from './ChangePaymentPassword.js'

const WalletSettings = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const wallet = useWallet()
    const theme = useTheme()
    const { classes, cx } = useStyles()

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
                <ListItem className={classes.item}>
                    <Box className={classes.itemBox}>
                        <Icons.PersonasOutline size={20} color={theme.palette.maskColor.second} />
                        <Typography className={classes.itemText}>{t('popups_change_owner')}</Typography>
                    </Box>
                    <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
                </ListItem>
                <Rename />
                <Contacts />
                <AutoLock />
                <ListItem className={classes.item}>
                    <Box className={classes.itemBox}>
                        <Icons.Currency size={20} color={theme.palette.maskColor.second} />
                        <Typography className={classes.itemText}>{t('currency')}</Typography>
                    </Box>
                    <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
                </ListItem>
                <ChangePaymentPassword />
                <ListItem className={classes.item}>
                    <Box className={classes.itemBox}>
                        <Icons.PublicKey2 size={20} color={theme.palette.maskColor.second} />
                        <Typography className={classes.itemText}>
                            {t('popups_wallet_settings_show_private_key')}
                        </Typography>
                    </Box>
                    <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
                </ListItem>
            </List>
        </div>
    )
})

export default WalletSettings
