import { memo, useCallback, useEffect, useMemo } from 'react'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { Box, Typography, useTheme } from '@mui/material'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Trend } from '../../../assets/index.js'
import { CrossIsolationMessages, EnhanceableSite, PopupRoutes, userGuideStatus } from '@masknet/shared-base'

import Services from '#services'
import { delay } from '@masknet/kit'
import { OnboardingWriter } from '../../../components/OnboardingWriter/index.js'
import { useSearchParams } from 'react-router-dom'
import { compact } from 'lodash-es'
import { isZero } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { TwitterAdaptor } from '../../../../shared/site-adaptors/implementations/twitter.com.js'
import { requestPermissionFromExtensionPage } from '../../../../shared-ui/index.js'
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
    twitter: {
        color: theme.palette.maskColor.bottom,
    },
}))

export const Component = memo(function Onboarding() {
    const t = useDashboardTrans()
    const { _ } = useLingui()
    const { classes } = useStyles()

    const [params] = useSearchParams()
    const { showSnackbar } = useCustomSnackbar()
    const theme = useTheme()
    const isCreate = params.get('isCreate')
    const count = params.get('count')
    const { value: hasPaymentPassword, loading, retry } = useAsyncRetry(Services.Wallet.hasPassword, [])

    const onSetupTwitter = useCallback(async () => {
        if (!(await requestPermissionFromExtensionPage(EnhanceableSite.Twitter))) return
        if (!userGuideStatus[EnhanceableSite.Twitter].value) userGuideStatus[EnhanceableSite.Twitter].value = '1'
        await delay(300)
        await browser.tabs.create({
            active: true,
            url: TwitterAdaptor.homepage,
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
            showSnackbar(<Trans>Set Payment Password</Trans>, {
                variant: 'success',
                message: <Trans>Payment password set.</Trans>,
            })
        })
    }, [retry])

    const words = useMemo(() => {
        const count = params.get('count')
        return compact([
            <Typography key="identity">
                {_(msg`Creating your `)}
                {_(msg`identity`)}
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
                {_('Your Persona is on ')}
                {_('ready 🚀')}
            </Typography>,
            count && !isZero(count) ?
                <Typography key="wallets">
                    {_('You have recovered ')}
                    {t.persona_onboarding_wallets({ count: Number(count) })}
                </Typography>
            :   undefined,
        ])
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
                    <Trans>Experience in X</Trans>
                </PrimaryButton>
                {!isCreate && count && !isZero(count) ?
                    <PrimaryButton
                        loading={loading}
                        disabled={loading}
                        onClick={onSetupPaymentPassword}
                        size="large"
                        sx={{ ml: 1.5 }}
                        startIcon={<Icons.Wallet className={classes.twitter} size={20} />}>
                        {hasPaymentPassword ?
                            <Trans>Open Mask Wallet</Trans>
                        :   <Trans>Set Payment Password</Trans>}
                    </PrimaryButton>
                :   null}
            </SetupFrameController>
        </>
    )
})
