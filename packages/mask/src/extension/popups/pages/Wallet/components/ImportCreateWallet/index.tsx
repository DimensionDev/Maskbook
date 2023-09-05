import { Icons } from '@masknet/icons'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../../utils/index.js'
import { useAsyncFn } from 'react-use'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'

const useStyles = makeStyles()((theme) => {
    return {
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
    }
})

interface Props {
    /** Choose creating or importing wallet */
    onChoose?(route: DashboardRoutes): void
}

export const ImportCreateWallet = memo<Props>(function ImportCreateWallet({ onChoose }) {
    const { t } = useI18N()
    const { classes, cx, theme } = useStyles()
    const [, handleChoose] = useAsyncFn(
        async (route: DashboardRoutes) => {
            const hasPassword = await WalletServiceRef.value.hasPassword()
            await browser.tabs.create({
                active: true,
                url: browser.runtime.getURL(
                    `/dashboard.html#${hasPassword ? route : DashboardRoutes.CreateMaskWalletForm}${
                        route === DashboardRoutes.RecoveryMaskWallet && !hasPassword ? '?recover=true' : ''
                    }`,
                ),
            })
            onChoose?.(route)
        },
        [onChoose],
    )

    return (
        <>
            <Box
                className={classes.addWalletWrapper}
                onClick={() => handleChoose(DashboardRoutes.CreateMaskWalletMnemonic)}>
                <div className={cx(classes.iconWrapper, classes.walletIcon)}>
                    <Icons.Wallet size={20} color={theme.palette.maskColor.white} />
                </div>
                <div>
                    <Typography className={classes.subTitle}>{t('popups_create_a_new_wallet_title')}</Typography>
                    <Typography className={classes.description}>{t('popups_generate_a_new_wallet_address')}</Typography>
                </div>
            </Box>

            <Box className={classes.addWalletWrapper} onClick={() => handleChoose(DashboardRoutes.RecoveryMaskWallet)}>
                <div className={cx(classes.iconWrapper, classes.mnemonicIcon)}>
                    <Icons.Mnemonic size={20} color={theme.palette.maskColor.white} />
                </div>
                <div>
                    <Typography className={classes.subTitle}>{t('popups_import_wallets')}</Typography>
                    <Typography className={classes.description}>{t('popups_import_wallets_description')}</Typography>
                </div>
            </Box>
        </>
    )
})
