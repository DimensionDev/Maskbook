import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, useTheme } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../../utils/index.js'
import Services from '../../../../../service.js'
import { DashboardRoutes, Sniffings } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.secondaryBottom,
    },
    content: {
        padding: 16,
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        padding: 16,
        display: 'flex',
        marginBottom: 12,
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontWeight: 700,
    },
    addWalletWrapper: {
        display: 'flex',
        width: 368,
        padding: 12,
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        background: theme.palette.maskColor.bottom,
        borderRadius: 8,
        cursor: 'pointer',
    },
    subTitle: {
        color: theme.palette.maskColor.main,
        fontSize: 12,
        fontWeight: 700,
    },
    description: {
        color: theme.palette.maskColor.third,
        fontSize: 12,
        fontWeight: 400,
    },
    placeholderDescription: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        width: 270,
        marginTop: theme.spacing(1.5),
        textAlign: 'center',
    },
    mnemonicIcon: {
        background: theme.palette.maskColor.success,
    },
    walletIcon: {
        background: theme.palette.maskColor.primary,
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        borderRadius: '100%',
    },
}))

export const WalletStartUp = memo(() => {
    const { t } = useI18N()
    const { cx, classes } = useStyles()
    const theme = useTheme()

    const [, onEnterCreateWallet] = useAsyncFn(async (route: DashboardRoutes) => {
        const hasPassword = await WalletServiceRef.value.hasPassword()
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(
                `/dashboard.html#${hasPassword ? route : DashboardRoutes.CreateMaskWalletForm}${
                    route === DashboardRoutes.RecoveryMaskWallet && !hasPassword ? '?recover=true' : ''
                }`,
            ),
        })
        if (Sniffings.is_firefox) {
            window.close()
        }

        await Services.Helper.removePopupWindow()
    }, [])

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>{t('popups_add_wallet')}</Typography>
                    <Typography className={classes.placeholderDescription}>
                        {t('popups_add_wallet_description')}
                    </Typography>
                </Box>
                <Box
                    className={classes.addWalletWrapper}
                    onClick={() => onEnterCreateWallet(DashboardRoutes.CreateMaskWalletMnemonic)}>
                    <div className={cx(classes.iconWrapper, classes.walletIcon)}>
                        <Icons.Wallet size={20} color={theme.palette.maskColor.white} />
                    </div>
                    <div>
                        <Typography className={classes.subTitle}>{t('popups_create_a_new_wallet_title')}</Typography>
                        <Typography className={classes.description}>
                            {t('popups_generate_a_new_wallet_address')}
                        </Typography>
                    </div>
                </Box>

                <Box
                    className={classes.addWalletWrapper}
                    onClick={() => onEnterCreateWallet(DashboardRoutes.RecoveryMaskWallet)}>
                    <div className={cx(classes.iconWrapper, classes.mnemonicIcon)}>
                        <Icons.Mnemonic size={20} color={theme.palette.maskColor.white} />
                    </div>
                    <div>
                        <Typography className={classes.subTitle}>{t('popups_import_wallets')}</Typography>
                        <Typography className={classes.description}>
                            {t('popups_import_wallets_description')}
                        </Typography>
                    </div>
                </Box>
            </Box>
        </Box>
    )
})
