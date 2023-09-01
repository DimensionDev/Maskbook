import { DashboardRoutes, EnhanceableSite } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import Services from '#services'
import { TermsAgreedContext } from '../../../hooks/useTermsAgreed.js'
import { DashboardTrans, useDashboardI18N } from '../../../locales/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'

import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { Article } from './Article.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    checkboxRow: {
        marginTop: theme.spacing(1),
        marginLeft: 0,
    },
    label: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        marginRight: 0,
        marginLeft: 0,
    },
    link: {
        color: theme.palette.maskColor.main,
        textDecoration: 'underline',
    },
    checkbox: {
        margin: '-9px 12px -9px -9px',
    },
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
    },
    policy: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        marginTop: 48,
    },
}))

export const Welcome = memo(function Welcome() {
    const [, setAgreed] = TermsAgreedContext.useContainer()
    const [allowedToCollect, setAllowedToCollect] = useState(true)
    const [params] = useSearchParams()
    const navigate = useNavigate()

    const handleAgree = useCallback(async () => {
        if (allowedToCollect) {
            Services.Settings.setTelemetryEnabled(true)
        }
        setAgreed(true)
        const from = params.get('from')
        const hasRedirect = from && from !== DashboardRoutes.Personas
        if (hasRedirect) {
            const search = params.get('search')
            navigate(urlcat(from, search ? new URLSearchParams(search).entries() : {}))
            return
        }

        const url = await Services.SiteAdaptor.setupSite(EnhanceableSite.Twitter, false)
        if (!url) return

        navigate(DashboardRoutes.SignUpPersona, { replace: true })
    }, [params, allowedToCollect])

    const t = useDashboardI18N()
    const { classes } = useStyles()

    return (
        <>
            <Typography variant="h1" className={classes.title}>
                {t.welcome_to_use_mask_network()}
            </Typography>
            <Article />

            <FormControlLabel
                classes={{ label: classes.label, root: classes.checkboxRow }}
                control={
                    <Checkbox
                        className={classes.checkbox}
                        checked={allowedToCollect}
                        onChange={(event) => {
                            setAllowedToCollect(event.currentTarget.checked)
                        }}
                    />
                }
                label={t.welcome_request_to_collect()}
            />
            <SetupFrameController>
                <div className={classes.buttonGroup}>
                    <SecondaryButton width="125px" size="large" onClick={() => window.close()}>
                        {t.cancel()}
                    </SecondaryButton>
                    <PrimaryButton width="125px" size="large" color="primary" onClick={handleAgree}>
                        {t.agree()}
                    </PrimaryButton>
                </div>
                <Typography className={classes.policy}>
                    <DashboardTrans.welcome_new_agreement_policy
                        components={{
                            agreement: (
                                <a
                                    className={classes.link}
                                    target="_blank"
                                    href="https://legal.mask.io/maskbook/service-agreement-beta-browser.html"
                                />
                            ),
                            policy: (
                                <a
                                    className={classes.link}
                                    target="_blank"
                                    href="https://legal.mask.io/maskbook/privacy-policy-browser.html"
                                />
                            ),
                        }}
                    />
                </Typography>
            </SetupFrameController>
        </>
    )
})
