import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { DashboardTrans } from '../../../locales/i18n_generated.js'
import Services from '#services'
import { useAsync } from 'react-use'
import { sortBy } from 'lodash-es'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { requestPermissionFromExtensionPage } from '../../../../shared-ui/index.js'
import { definedSiteAdaptors } from '../../../../shared/site-adaptors/definitions.js'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    p: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        marginTop: 24,
    },
    h2: {
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.maskColor.main,
    },
    list: {
        marginTop: theme.spacing(2),
        paddingLeft: 0,
        marginLeft: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(3),
    },
    listItem: {
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        listStyleType: 'none',
        paddingLeft: 0,
        marginLeft: 0,
        display: 'flex',
        alignItems: 'center',
    },
    siteName: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '20px',
        marginLeft: theme.spacing(1),
    },
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
    },
    link: {
        color: theme.palette.maskColor.main,
        textDecoration: 'underline',
    },
    policy: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        marginTop: 48,
    },
}))

export const Component = memo(function Permission() {
    const { classes } = useStyles()
    const navigate = useNavigate()

    const { value: sites = EMPTY_LIST } = useAsync(() => {
        return Services.SiteAdaptor.getSitesWithoutPermission()
    }, [])

    const handleAgree = useCallback(async () => {
        const granted = await requestPermissionFromExtensionPage(
            [...definedSiteAdaptors.values()].flatMap((x) => x.declarativePermissions.origins),
        )
        if (!granted) return
        navigate(DashboardRoutes.PermissionsOnboarding, { replace: true })
    }, [])

    return (
        <>
            <Typography variant="h1" className={classes.title}>
                <Trans>Update permission for X.com</Trans>
            </Typography>

            <article>
                <Typography className={classes.p}>
                    Because Twitter is now using the new domain name x.com, Mask Network requires new permission in
                    order to continue working on x.com.
                </Typography>

                <Typography className={classes.h2} variant="h2" mt="24px">
                    Please grant us permission for these websites.
                </Typography>

                <ul className={classes.list}>
                    {sortBy(sites, (x) => x.sortIndex).map(({ networkIdentifier, name }) => {
                        const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[networkIdentifier] ?? Icons.Globe
                        return (
                            <li className={classes.listItem} key={networkIdentifier}>
                                <Icon size={20} />
                                <Typography component="span" className={classes.siteName}>
                                    {name}
                                </Typography>
                            </li>
                        )
                    })}
                </ul>
            </article>

            <SetupFrameController>
                <div className={classes.buttonGroup}>
                    <SecondaryButton width="125px" size="large" onClick={() => window.close()}>
                        <Trans>Cancel</Trans>
                    </SecondaryButton>
                    <PrimaryButton width="125px" size="large" color="primary" onClick={handleAgree}>
                        <Trans>Agree</Trans>
                    </PrimaryButton>
                </div>
                <Typography className={classes.policy}>
                    {/* eslint-disable-next-line react/naming-convention/component-name */}
                    <DashboardTrans.welcome_new_agreement_policy
                        components={{
                            agreement: (
                                <a
                                    className={classes.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://legal.mask.io/maskbook/service-agreement-beta-browser.html"
                                />
                            ),
                            policy: (
                                <a
                                    className={classes.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
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
