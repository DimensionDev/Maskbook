import { experimentalStyled as styled, makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Dialog, IconButton, Link as MuiLink, Theme, Typography } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { memo, useState } from 'react'
import { About } from './About'
import { Close } from '@material-ui/icons'
import { Version } from './Version'
import { getMaskColor } from '@masknet/theme'
import links from './links.json'
import { RoutePaths } from '../../type'

const useStyles = makeStyles((theme: Theme) => ({
    navRoot: {
        padding: '40px 0',
    },
    ol: {
        justifyContent: 'center',
    },
    footerLink: {
        display: 'inline-flex',
        borderRadius: '0',
        whiteSpace: 'nowrap',
        padding: '4px 20px',
    },
    separator: {
        color: getMaskColor(theme).lineLight,
    },
    closeButton: {
        color: theme.palette.text.secondary,
        position: 'absolute',
        right: 12,
        top: 0,
    },
}))

const AboutDialog = styled(Dialog)(
    ({ theme }) => `
    padding: 0;
    overflow: hidden;
`,
)

type FooterLinkBaseProps = { title?: string }
type FooterLinkLinkProps = FooterLinkBaseProps & { to: string }
type FooterLinkAnchorProps = FooterLinkBaseProps & { href: string }
type FooterLinkAnchorButtonProps = FooterLinkBaseProps & { onClick(e: React.MouseEvent<HTMLAnchorElement>): void }

type FooterLinkProps = FooterLinkLinkProps | FooterLinkAnchorProps | FooterLinkAnchorButtonProps

const FooterLink = function (props: React.PropsWithChildren<FooterLinkProps>) {
    const classes = useStyles()
    const children = (
        <Typography variant="body2" component="span">
            {props.children}
        </Typography>
    )
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

export const FooterLine = memo(() => {
    const t = useDashboardI18N()
    const classes = useStyles()
    const [isOpen, setOpen] = useState(false)
    const version = globalThis.browser?.runtime.getManifest()?.version ?? process.env.TAG_NAME.slice(1)

    const openVersionLink = (event: React.MouseEvent) => {
        // `MouseEvent.prototype.metaKey` on macOS (`Command` key), Windows (`Windows` key), Linux (`Super` key)
        if (process.env.build === 'stable' && !event.metaKey) {
            open(`${links.DOWNLOAD_LINK_STABLE_PREFIX}/v${version}`)
        } else {
            open(`${links.DOWNLOAD_LINK_UNSTABLE_PREFIX}/${process.env.COMMIT_HASH}`)
        }
    }
    return (
        <>
            <Breadcrumbs
                classes={{ separator: classes.separator, ol: classes.ol, root: classes.navRoot }}
                separator="|"
                aria-label="breadcrumb">
                <FooterLink href={links.MASK_OFFICIAL_WEBSITE}>Mask.io</FooterLink>
                <FooterLink onClick={() => setOpen(true)}>{t.about()}</FooterLink>
                <FooterLink onClick={openVersionLink} title={process.env.VERSION}>
                    <Version />
                </FooterLink>
                <FooterLink href={links.MOBILE_DOWNLOAD_LINK}>{t.dashboard_mobile_test()}</FooterLink>
                <FooterLink href={links.MASKBOOK_GITHUB}>{t.dashboard_source_code()}</FooterLink>
                <FooterLink href={links.BOUNTY_LIST}>{t.footer_bounty_list()}</FooterLink>
                <FooterLink to={RoutePaths.PrivacyPolicy}>{t.privacy_policy()}</FooterLink>
            </Breadcrumbs>
            <AboutDialog open={isOpen} title="" onClose={() => setOpen(false)}>
                <About />
                <IconButton className={classes.closeButton} onClick={() => setOpen(false)} edge="end" color="inherit">
                    <Close />
                </IconButton>
            </AboutDialog>
        </>
    )
})
