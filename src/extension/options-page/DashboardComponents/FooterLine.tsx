import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Theme, Typography, Link as MuiLink } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DashboardAboutDialog } from '../Dialog/About'
import { useModal } from '../Dialog/Base'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        footerButtons: {
            '& ol': {
                justifyContent: 'center',
            },
        },
        footerButton: {
            borderRadius: '0',
            whiteSpace: 'nowrap',
            '& > span': {
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
            },
        },
    }),
)

const FooterLink = function (
    props: React.PropsWithChildren<{ href?: string; title?: string; to?: string; onClick?(): void }>,
) {
    const classes = useStyles()
    return (
        <MuiLink
            underline="none"
            {...('href' in props
                ? { href: props.href, title: props.title, target: '_blank', rel: 'noopener noreferrer' }
                : 'to' in props
                ? { to: props.to, component: Link }
                : { style: { cursor: 'pointer' }, onClick: props.onClick, component: 'a' })}
            color="inherit"
            className={classes.footerButton}>
            <Typography variant="body2">{props.children}</Typography>
        </MuiLink>
    )
}

export default function FooterLine() {
    const { t } = useI18N()
    const classes = useStyles()
    const { version } = globalThis?.browser.runtime.getManifest()
    const versionLink = t('version_link', { tag: process.env.VERSION })

    const [aboutDialog, openAboutDialog] = useModal(DashboardAboutDialog)

    return (
        <>
            <Breadcrumbs className={classes.footerButtons} separator=" " aria-label="breadcrumb">
                <FooterLink href="https://maskbook.com/">Maskbook.com</FooterLink>
                <FooterLink onClick={openAboutDialog}>About</FooterLink>
                <FooterLink href={versionLink} title={process.env.VERSION}>
                    {t('version')} {version}
                </FooterLink>
                <FooterLink href={t('dashboard_mobile_test_link')}>{t('dashboard_mobile_test')}</FooterLink>
                <FooterLink href={t('dashboard_source_code_link')}>{t('dashboard_source_code')}</FooterLink>
                <FooterLink href={t('privacy_policy_link')}>{t('privacy_policy')}</FooterLink>
            </Breadcrumbs>
            {aboutDialog}
        </>
    )
}
