import Services from '#services'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { DashboardRoutes, EnhanceableSite, userGuideStatus } from '@masknet/shared-base'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { memo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { requestPermissionFromExtensionPage } from '../../../../shared-ui/index.js'
import { definedSiteAdaptors } from '../../../../shared/site-adaptors/definitions.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { TermsAgreedContext } from '../../../hooks/useTermsAgreed.js'
import { Article } from './Article.js'
import { XOAuthRequestOrigins } from '../../../../shared/definitions/extension.js'

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

export const Component = memo(function Welcome() {
    const { classes } = useStyles()
    const [, setAgreed] = TermsAgreedContext.useContainer()
    const [allowedToCollect, setAllowedToCollect] = useState(true)
    const [params] = useSearchParams()
    const navigate = useNavigate()

    const snackbar = useCustomSnackbar()
    const [{ loading }, handleAgree] = useAsyncFn(async () => {
        if (allowedToCollect) {
            Services.Settings.setTelemetryEnabled(true)
        }
        setAgreed(true)

        try {
            const siteOrigins = [...definedSiteAdaptors.values()].flatMap((x) => x.declarativePermissions.origins)
            const granted = await requestPermissionFromExtensionPage([...siteOrigins, ...XOAuthRequestOrigins])
            if (!granted) return
            if (!userGuideStatus[EnhanceableSite.Twitter].value) userGuideStatus[EnhanceableSite.Twitter].value = '1'
        } catch (err) {
            snackbar.showSnackbar(t`Failed to get permissions`, { variant: 'error' })
            throw err
        }
        const from = params.get('from')
        const hasRedirect = from && from !== DashboardRoutes.Personas
        if (hasRedirect) {
            const search = params.get('search') || ''
            navigate(from + search)
            return
        }
        navigate(DashboardRoutes.SignUpPersona, { replace: true })
    }, [params, allowedToCollect])

    return (
        <>
            <Typography variant="h1" className={classes.title}>
                <Trans>Welcome to use Mask Network</Trans>
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
                label={<Trans>Allow us to collect your usage information to help us improve Mask.</Trans>}
            />
            <SetupFrameController>
                <div className={classes.buttonGroup}>
                    <SecondaryButton variant="rounded" width="125px" size="large" onClick={() => window.close()}>
                        <Trans>Cancel</Trans>
                    </SecondaryButton>
                    <PrimaryButton width="125px" size="large" color="primary" onClick={handleAgree} disabled={loading}>
                        <Trans>Agree</Trans>
                    </PrimaryButton>
                </div>
                <Typography className={classes.policy}>
                    <Trans>
                        By continuing to the app, you agree to these{' '}
                        <a
                            className={classes.link}
                            target="_blank"
                            rel="noreferrer noopener"
                            href="https://legal.mask.io/maskbook/service-agreement-beta-browser.html">
                            Service Agreement
                        </a>{' '}
                        and{' '}
                        <a
                            className={classes.link}
                            target="_blank"
                            rel="noreferrer noopener"
                            href="https://legal.mask.io/maskbook/privacy-policy-browser.html">
                            Privacy Policy
                        </a>
                        .
                    </Trans>
                </Typography>
            </SetupFrameController>
        </>
    )
})
