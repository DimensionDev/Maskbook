import { memo, useCallback, useMemo } from 'react'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { Box, Typography } from '@mui/material'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Trend } from '../../../assets/index.js'
import { PopupRoutes } from '@masknet/shared-base'

import { Services } from '../../../../shared-ui/service.js'
import { OnboardingWriter } from '../../../components/OnboardingWriter/index.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        position: 'fixed',
        top: 24,
        right: 24,
        padding: theme.spacing(2),
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 12,
        maxWidth: 360,
    },
    pin: {
        fontSize: 16,
        lineHeight: '20px',
        color: theme.palette.maskColor.main,
    },
    skeleton: {
        background: 'linear-gradient(270deg, #F6F6F6 0%, rgba(217, 217, 217, 0) 94.74%)',
        width: 190,
        height: 36,
        borderRadius: 99,
        marginLeft: 42,
    },
    plugins: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        height: 36,
        borderRadius: 99,
        // hard color
        background: '#F0F0F4',
        marginLeft: 18,
        marginRight: 18,
    },
    more: {
        transform: 'rotate(90deg)',
    },
    pinCard: {
        marginTop: 18,
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        background: theme.palette.maskColor.bottom,
        padding: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trend: {
        position: 'fixed',
        top: 206,
        right: 408,
    },
}))

const Onboarding = memo(function Onboarding() {
    const t = useDashboardI18N()
    const { classes } = useStyles()

    const onOpenPopupWallet = useCallback(async () => {
        await Services.Helper.openPopupWindow(PopupRoutes.Wallet)
        window.close()
    }, [])

    const words = useMemo(() => {
        return [
            <Typography key="identity">
                {t.create_wallet_onboarding_creating_identity()}
                {t.onboarding_wallet()}
            </Typography>,
            <Typography key="account">
                {t.create_wallet_onboarding_generating_accounts()}
                {t.accounts()}
            </Typography>,
            <Typography key="data">
                {t.create_wallet_onboarding_encrypting_data()}
                {t.data()}
            </Typography>,
            <Typography key="ready">
                {t.create_wallet_onboarding_ready()}
                {t.ready()}
            </Typography>,
        ]
    }, [t])

    return (
        <>
            <Box className={classes.card}>
                <Typography className={classes.pin}>{t.persona_onboarding_pin_tips()}</Typography>
                <Box mt={2.25} display="flex" alignItems="center">
                    <Box className={classes.skeleton} />
                    <Box className={classes.plugins}>
                        <Icons.Plugins size={20} />
                    </Box>
                    <Icons.More className={classes.more} size={24} />
                </Box>
                <Box className={classes.pinCard}>
                    <Box display="flex" alignItems="center" columnGap={2.5}>
                        <Icons.MaskBlue size={32} />
                        {/* There is no need for i18n here. */}
                        <Typography>Mask Network</Typography>
                    </Box>
                    <Icons.BluePin size={14} width={9} />
                </Box>
            </Box>
            <img className={classes.trend} src={Trend.toString()} />
            <Box>
                <OnboardingWriter words={words} />
            </Box>
            <SetupFrameController>
                <PrimaryButton onClick={onOpenPopupWallet} size="large" width={'228px'}>
                    <Typography fontWeight={700}>{t.create_wallet_onboarding_got_it()}</Typography>
                </PrimaryButton>
            </SetupFrameController>
        </>
    )
})

export default Onboarding
