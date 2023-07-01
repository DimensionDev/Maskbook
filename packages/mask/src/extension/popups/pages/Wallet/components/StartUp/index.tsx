import { Icons } from '@masknet/icons'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Alert, AlertTitle, Box, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import urlcat from 'urlcat'
import { useI18N } from '../../../../../../utils/index.js'
import Services from '../../../../../service.js'
import { NetworkSelector } from '../../../../components/NetworkSelector/index.js'
import { useHasPassword } from '../../../../hook/useHasPassword.js'
import { useTitle } from '../../../../hook/useTitle.js'

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
    const location = useLocation()

    const onEnterCreateWallet = useCallback(async () => {
        const params = new URLSearchParams(location.search)
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(
                urlcat('/dashboard.html#/create-mask-wallet/form', { chainId: params.get('chainId') }),
            ),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }

        await Services.Helper.removePopupWindow()
    }, [location.search])

    const { hasPassword, loading } = useHasPassword()

    useTitle('')

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
                    <Icons.MaskWallet size={24} />
                    <Typography className={classes.itemTitle}>{t('wallet_new')}</Typography>
                </Box>
                {!loading ? (
                    <Link
                        to={!hasPassword ? PopupRoutes.SetPaymentPassword : PopupRoutes.ImportWallet}
                        onClick={(event) => {
                            if (!navigator.userAgent.includes('Firefox')) return
                            const params = new URLSearchParams(location.search)
                            const toBeClose = params.get('toBeClose')
                            if (!toBeClose) {
                                event.preventDefault()
                                event.stopPropagation()
                                Services.Helper.openPopupWindow(
                                    !hasPassword ? PopupRoutes.SetPaymentPassword : PopupRoutes.ImportWallet,
                                )
                            }
                        }}
                        style={{ textDecoration: 'none' }}>
                        <Box className={classes.item}>
                            <Icons.ImportWallet size={24} />
                            <Typography className={classes.itemTitle}>{t('plugin_wallet_import_wallet')}</Typography>
                        </Box>
                    </Link>
                ) : null}
            </Box>
        </Box>
    )
})
