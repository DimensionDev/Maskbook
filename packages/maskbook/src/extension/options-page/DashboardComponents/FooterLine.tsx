import { makeStyles } from '@masknet/theme'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Typography, Link as MuiLink } from '@mui/material'
import { useI18N } from '../../../utils'
import { DashboardAboutDialog } from '../DashboardDialogs/About'
import { useModal } from '../DashboardDialogs/Base'

const useStyles = makeStyles()({
    footerButtons: {
        '& ol': {
            justifyContent: 'center',
        },
    },
    footerLink: {
        borderRadius: '0',
        whiteSpace: 'nowrap',
        '& > p': {
            fontSize: 12,
        },
    },
})

type FooterLinkBaseProps = { title?: string }
type FooterLinkLinkProps = FooterLinkBaseProps & { to: string }
type FooterLinkAnchorProps = FooterLinkBaseProps & { href: string }
type FooterLinkAnchorButtonProps = FooterLinkBaseProps & { onClick(e: React.MouseEvent<HTMLAnchorElement>): void }

type FooterLinkProps = FooterLinkLinkProps | FooterLinkAnchorProps | FooterLinkAnchorButtonProps

const FooterLink = function (props: React.PropsWithChildren<FooterLinkProps>) {
    const { classes } = useStyles()
    const children = <Typography variant="body2">{props.children}</Typography>
    if ('href' in props)
        return (
            <MuiLink
                underline="none"
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                color="textPrimary"
                className={classes.footerLink}>
                {children}
            </MuiLink>
        )
    if ('to' in props)
        return (
            <MuiLink underline="none" {...props} component={Link} color="textPrimary" className={classes.footerLink}>
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
            className={classes.footerLink}>
            {children}
        </MuiLink>
    )
}

export default function FooterLine() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [aboutDialog, openAboutDialog] = useModal(DashboardAboutDialog)
    const version = globalThis.browser?.runtime.getManifest()?.version ?? process.env.TAG_NAME.slice(1)
    const openVersionLink = (event: React.MouseEvent) => {
        // `MouseEvent.prototype.metaKey` on macOS (`Command` key), Windows (`Windows` key), Linux (`Super` key)
        if (process.env.channel === 'stable' && !event.metaKey) {
            open(t('version_of_release', { tag: `v${version}` }))
        } else {
            open(t('version_of_hash', { hash: process.env.COMMIT_HASH }))
        }
    }
    return (
        <>
            <Breadcrumbs className={classes.footerButtons} separator="-" aria-label="breadcrumb">
                <FooterLink href="https://mask.io">Mask.io</FooterLink>
                <FooterLink onClick={openAboutDialog}>{t('about')}</FooterLink>
                <FooterLink onClick={openVersionLink} title={process.env.VERSION}>
                    {t(process.env.channel === 'stable' ? 'version_of_stable' : 'version_of_unstable', {
                        version,
                        build: process.env.channel,
                        hash: process.env.COMMIT_HASH,
                    })}
                </FooterLink>
                <FooterLink href={t('dashboard_mobile_test_link')}>{t('dashboard_mobile_test')}</FooterLink>
                <FooterLink href={t('dashboard_source_code_link')}>{t('dashboard_source_code')}</FooterLink>
                <FooterLink href={t('dashboard_bounty_list_link')}>{t('dashboard_bounty_list')}</FooterLink>
                <FooterLink href={t('privacy_policy_link')}>{t('privacy_policy')}</FooterLink>
            </Breadcrumbs>
            {aboutDialog}
        </>
    )
}
