import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Theme, Typography, Link as MuiLink } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DashboardAboutDialog } from '../Dialogs/About'
import { useModal } from '../Dialogs/Base'

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
            '& > p': {
                fontSize: 12,
            },
        },
    }),
)

type FooterLinkBaseProps = { title?: string }
type FooterLinkLinkProps = FooterLinkBaseProps & { to: string }
type FooterLinkAnchorProps = FooterLinkBaseProps & { href: string }
type FooterLinkAnchorButtonProps = FooterLinkBaseProps & { onClick(e: React.MouseEvent<HTMLAnchorElement>): void }

type FooterLinkProps = FooterLinkLinkProps | FooterLinkAnchorProps | FooterLinkAnchorButtonProps

const FooterLink = function (props: React.PropsWithChildren<FooterLinkProps>) {
    const classes = useStyles()
    const children = <Typography variant="body2">{props.children}</Typography>
    if ('href' in props)
        return (
            <MuiLink
                underline="none"
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                color="textPrimary"
                className={classes.footerButton}>
                {children}
            </MuiLink>
        )
    if ('to' in props)
        return (
            <MuiLink underline="none" {...props} component={Link} color="textPrimary" className={classes.footerButton}>
                {children}
            </MuiLink>
        )
    return (
        <MuiLink
            underline="none"
            {...props}
            component="a"
            style={{ cursor: 'pointer' }}
            color="textPrimary"
            className={classes.footerButton}>
            {children}
        </MuiLink>
    )
}

export default function FooterLine() {
    const { t } = useI18N()
    const classes = useStyles()
    const { version } = globalThis.browser?.runtime.getManifest() ?? {}
    const versionLink = t('version_link', { tag: process.env.VERSION })

    const [aboutDialog, openAboutDialog] = useModal(DashboardAboutDialog)

    return (
        <>
            <Breadcrumbs className={classes.footerButtons} separator=" " aria-label="breadcrumb">
                <FooterLink href="https://maskbook.com/">Maskbook.com</FooterLink>
                <FooterLink onClick={openAboutDialog}>{t('about')}</FooterLink>
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
