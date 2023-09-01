import { memo, useCallback, useEffect, useMemo } from 'react'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { Box, Typography, useTheme } from '@mui/material'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Trend } from '../../../assets/index.js'
import { CrossIsolationMessages, EnhanceableSite, PopupRoutes } from '@masknet/shared-base'

import { Services } from '../../../../shared-ui/service.js'
import { delay } from '@masknet/kit'
import { OnboardingWriter } from '../../../components/OnboardingWriter/index.js'
import { useSearchParams } from 'react-router-dom'
import { compact } from 'lodash-es'
import { isZero } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'

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
    twitter: {
        color: theme.palette.maskColor.bottom,
    },
}))

export const Onboarding = memo(function Onboarding() {
    const t = useDashboardI18N()
    const { classes } = useStyles()

    const [params] = useSearchParams()
    const { showSnackbar } = useCustomSnackbar()
    const theme = useTheme()
    const isCreate = params.get('isCreate')

    const { value: hasPaymentPassword, loading, retry } = useAsyncRetry(WalletServiceRef.value.hasPassword, [])

    const onSetupTwitter = useCallback(async () => {
        const url = await Services.SiteAdaptor.setupSite(EnhanceableSite.Twitter, false)
        if (!url) return
        await delay(300)
        await browser.tabs.create({
            active: true,
            url,
        })
        window.close()
    }, [])

    const onSetupPaymentPassword = useCallback(async () => {
        await Services.Helper.openPopupWindow(
            hasPaymentPassword ? PopupRoutes.Wallet : PopupRoutes.SetPaymentPassword,
            { isCreating: true },
        )
    }, [hasPaymentPassword])

    useEffect(() => {
        return CrossIsolationMessages.events.passwordStatusUpdated.on((hasPassword) => {
            if (!hasPassword) return
            retry()
            showSnackbar(t.persona_onboarding_set_payment_password(), {
                variant: 'success',
                message: t.wallet_set_payment_password_successfully(),
            })
        })
    }, [retry])

    const words = useMemo(() => {
        const count = params.get('count')
        return compact([
            <Typography key="identity">
                {t.persona_onboarding_creating_identity()}
                {t.identity()}
            </Typography>,
            <Typography key="account">
                {t.persona_onboarding_generating_accounts()}
                {t.accounts()}
            </Typography>,
            <Typography key="data">
                {t.persona_onboarding_encrypting_data()}
                {t.data()}
            </Typography>,
            <Typography key="ready">
                {t.persona_onboarding_ready()}
                {t.ready()}
            </Typography>,
            count && !isZero(count) ? (
                <Typography key="wallets">
                    {t.persona_onboarding_recovery_wallets()}
                    {t.persona_onboarding_wallets({ count: Number(count) })}
                </Typography>
            ) : undefined,
        ])
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
                <PrimaryButton
                    onClick={onSetupTwitter}
                    size="large"
                    startIcon={
                        <Icons.TwitterX
                            variant={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                            className={classes.twitter}
                            size={20}
                        />
                    }>
                    {t.persona_onboarding_to_twitter()}
                </PrimaryButton>
                {!isCreate ? (
                    <PrimaryButton
                        loading={loading}
                        disabled={loading}
                        onClick={onSetupPaymentPassword}
                        size="large"
                        sx={{ ml: 1.5 }}
                        startIcon={<Icons.Wallet className={classes.twitter} size={20} />}>
                        {hasPaymentPassword ? t.wallet_open_mask_wallet() : t.persona_onboarding_set_payment_password()}
                    </PrimaryButton>
                ) : null}
            </SetupFrameController>
        </>
    )
})
