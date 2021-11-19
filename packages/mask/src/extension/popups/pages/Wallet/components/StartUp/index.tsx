import { memo, useCallback } from 'react'
import { Alert, AlertTitle, Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Link } from 'react-router-dom'
import { MaskWalletIcon, ImportWalletIcon } from '@masknet/icons'
import { EnterDashboard } from '../../../../components/EnterDashboard'
import { NetworkSelector } from '../../../../components/NetworkSelector'
import { PopupRoutes } from '@masknet/shared-base'
import { useI18N } from '../../../../../../utils'
import { useHasPassword } from '../../../../hook/useHasPassword'
import Services from '../../../../../service'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    alert: {
        padding: '2px 10px',
        backgroundColor: '#EFF5FF',
    },
    alertTitle: {
        fontWeight: 600,
        fontSize: 14,
        color: '#1C68F3',
        marginBottom: 3,
        lineHeight: '20px',
    },
    alertContent: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
    },
    header: {
        padding: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 1,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
    },
    content: {
        flex: 1,
        backgroundColor: '#f7f9fa',
        paddingBottom: 40,
    },
    item: {
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        marginBottom: 1,
        cursor: 'pointer',
    },
    itemTitle: {
        fontSize: 16,
        lineHeight: 1.5,
        color: theme.palette.primary.main,
        fontWeight: 600,
        marginLeft: 15,
    },
}))

export const WalletStartUp = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()

    const onEnterCreateWallet = useCallback(async () => {
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL('/dashboard.html#/create-mask-wallet'),
        })
        await Services.Helper.removePopupWindow()
    }, [])

    const { hasPassword, loading } = useHasPassword()

    return (
        <Box className={classes.container}>
            <Alert icon={false} severity="info" className={classes.alert}>
                <AlertTitle className={classes.alertTitle}>{t('popups_welcome')}</AlertTitle>
                <Typography className={classes.alertContent}>{t('popups_wallet_start_up_tip')}</Typography>
            </Alert>
            <Box className={classes.content}>
                <Box className={classes.header}>
                    <Typography className={classes.title}>{t('wallet_new')}</Typography>
                    <NetworkSelector />
                </Box>
                <Box className={classes.item} onClick={onEnterCreateWallet}>
                    <MaskWalletIcon sx={{ fontSize: 24 }} />
                    <Typography className={classes.itemTitle}>{t('wallet_new')}</Typography>
                </Box>
                {!loading ? (
                    <Link
                        to={!hasPassword ? PopupRoutes.SetPaymentPassword : PopupRoutes.ImportWallet}
                        style={{ textDecoration: 'none' }}>
                        <Box className={classes.item}>
                            <ImportWalletIcon sx={{ fontSize: 24 }} />
                            <Typography className={classes.itemTitle}>{t('plugin_wallet_import_wallet')}</Typography>
                        </Box>
                    </Link>
                ) : null}
            </Box>
            <EnterDashboard />
        </Box>
    )
})
