import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardTrans, useDashboardI18N } from '../../../locales/i18n_generated.js'
import { Box, Typography } from '@mui/material'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Trend } from '../../../assets/index.js'
import { EnhanceableSite } from '@masknet/shared-base'

import { Services } from '../../../API.js'
import { delay } from '@masknet/kit'

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
    typed: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
        fontFamily: 'Consolas, Monaco',
        '& > strong': {
            color: theme.palette.maskColor.highlight,
        },
    },
    line: {
        width: '21em',
        borderRight: '1px solid transparent',
        animation: 'typing 3.5s steps(42, end)',
        wordBreak: 'break-all',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        '@keyframes typing': {
            from: { width: 0 },
            to: { width: '21em' },
        },
    },
    endTyping: {
        opacity: 0.5,
    },
    twitter: {
        color: theme.palette.maskColor.bottom,
    },
}))

export const Onboarding = memo(function Onboarding() {
    const t = useDashboardI18N()
    const { classes, cx } = useStyles()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const clean = setInterval(() => {
            setCurrent((prev) => {
                if (prev < 3) return prev + 1
                console.log(clean)
                clearInterval(clean)
                return prev
            })
        }, 4000)

        return () => clearInterval(clean)
    }, [])

    const words = useMemo(() => {
        return [
            <DashboardTrans.persona_onboarding_creating_identity key={0} components={{ strong: <strong /> }} />,
            <DashboardTrans.persona_onboarding_generating_accounts key={1} components={{ strong: <strong /> }} />,
            <DashboardTrans.persona_onboarding_encrypting_data key={2} components={{ strong: <strong /> }} />,
            <DashboardTrans.persona_onboarding_ready key={3} components={{ strong: <strong /> }} />,
        ]
    }, [])

    const onSetupTwitter = useCallback(async () => {
        const url = await Services.SocialNetwork.setupSite(EnhanceableSite.Twitter, false)
        if (!url) return
        await delay(300)
        browser.tabs.create({
            active: true,
            url,
        })
        window.close()
    }, [])

    return (
        <Box>
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
                {words.map((word, index) => {
                    if (current < index) return
                    return (
                        <Typography
                            className={cx(
                                classes.typed,
                                classes.line,
                                current !== index ? classes.endTyping : undefined,
                            )}
                            key={index}>
                            {word}
                        </Typography>
                    )
                })}
            </Box>
            <SetupFrameController>
                <PrimaryButton
                    size="large"
                    startIcon={<Icons.TwitterStroke className={classes.twitter} size={20} onClick={onSetupTwitter} />}>
                    {t.persona_onboarding_to_twitter()}
                </PrimaryButton>
            </SetupFrameController>
        </Box>
    )
})
