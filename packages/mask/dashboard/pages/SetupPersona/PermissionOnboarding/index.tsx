import { memo, useCallback, useMemo } from 'react'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { Box, Typography, useTheme } from '@mui/material'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Trend } from '../../../assets/index.js'
import { EnhanceableSite, userGuideStatus } from '@masknet/shared-base'

import { delay } from '@masknet/kit'
import { OnboardingWriter } from '../../../components/OnboardingWriter/index.js'
import { compact } from 'lodash-es'
import { TwitterAdaptor } from '../../../../shared/site-adaptors/implementations/twitter.com.js'
import { requestPermissionFromExtensionPage } from '../../../../shared-ui/index.js'
import { Trans } from '@lingui/macro'

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

    typed: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
        '& > strong': {
            color: theme.palette.maskColor.main,
        },
    },
    endTyping: {
        opacity: 1,
    },
}))

export const Component = memo(function Onboarding() {
    const t = useDashboardTrans()
    const { classes } = useStyles()

    const theme = useTheme()

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

    const words = useMemo(() => {
        return compact([
            <Typography key="identity">
                <Trans>
                    We are pleased to inform you that the authorization update for X website has been successfully
                    completed. You can now continue to enjoy all the features of Mask Network as usual. Thank you for
                    your continuous support!
                </Trans>
            </Typography>,
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
                <OnboardingWriter classes={{ typed: classes.typed, endTyping: classes.endTyping }} words={words} />
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
            </SetupFrameController>
        </>
    )
})
