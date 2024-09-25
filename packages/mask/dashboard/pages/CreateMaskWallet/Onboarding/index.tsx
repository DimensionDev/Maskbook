import { memo, useCallback, useMemo } from 'react'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { Box, Typography } from '@mui/material'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Trend } from '../../../assets/index.js'
import { PopupRoutes } from '@masknet/shared-base'

import Services from '#services'
import { OnboardingWriter } from '../../../components/OnboardingWriter/index.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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

export const Component = memo(function Onboarding() {
    const t = useDashboardTrans()
    const { classes } = useStyles()
    const { _ } = useLingui()

    const onOpenPopupWallet = useCallback(async () => {
        await Services.Helper.openPopupWindow(PopupRoutes.Wallet, {})
        window.close()
    }, [])

    const words = useMemo(() => {
        return [
            <Typography key="identity">
                {_(msg`Creating your `)}
                {_(msg`wallet`)}
            </Typography>,
            <Typography key="account">
                {_(msg`Generating your `)}
                {_(msg`accounts`)}
            </Typography>,
            <Typography key="data">
                {_(msg`Encrypting your `)}
                {_(msg`data`)}
            </Typography>,
            <Typography key="ready">
                {_(msg`Your Wallet is on `)}
                {_(msg`ready 🚀`)}
            </Typography>,
        ]
    }, [t])

    return (
        <>
            <Box className={classes.card}>
                <Typography className={classes.pin}>
                    <Trans>Pin Mask Network to the toolbar for easier access:</Trans>
                </Typography>
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
            <img className={classes.trend} src={Trend} />
            <Box>
                <OnboardingWriter words={words} />
            </Box>
            <SetupFrameController>
                <PrimaryButton onClick={onOpenPopupWallet} size="large" width={'228px'}>
                    <Typography fontWeight={700}>
                        <Trans>Got it</Trans>
                    </Typography>
                </PrimaryButton>
            </SetupFrameController>
        </>
    )
})
