import { memo, useCallback } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../../utils/index.js'
import { useHasPassword } from '../../../../hook/useHasPassword.js'
import Services from '../../../../../service.js'
import { Navigator } from '../../../../components/Navigator/index.js'
import { Icons } from '@masknet/icons'
import { DashboardRoutes } from '@masknet/shared-base'

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
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontFamily: 'Helvetica',
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
        fontFamily: 'Helvetica',
        fontWeight: 700,
    },
    description: {
        color: theme.palette.maskColor.third,
        fontSize: 12,
        fontFamily: 'Helvetica',
        fontWeight: 400,
    },
    mnemonicIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        background: theme.palette.maskColor.success,
        borderRadius: '100%',
    },
}))

export const WalletStartUp = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const theme = useTheme()

    const { hasPassword } = useHasPassword()

    const onEnterCreateWallet = useCallback(
        async (route_: DashboardRoutes) => {
            const route = hasPassword ? route_ : DashboardRoutes.CreateMaskWalletForm
            await browser.tabs.create({
                active: true,
                url: browser.runtime.getURL(`/dashboard.html#${route}`),
            })
            if (navigator.userAgent.includes('Firefox')) {
                window.close()
            }

            await Services.Helper.removePopupWindow()
        },
        [hasPassword],
    )

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>{t('popups_add_wallet')}</Typography>
                </Box>
                <Box
                    className={classes.addWalletWrapper}
                    onClick={() => onEnterCreateWallet(DashboardRoutes.CreateMaskWalletMnemonic)}>
                    <Icons.MaskBlue size={30} />
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
                    <div className={classes.mnemonicIcon}>
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
            <Navigator />
        </Box>
    )
})
