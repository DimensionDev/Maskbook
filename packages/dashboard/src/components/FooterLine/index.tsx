import { experimentalStyled as styled, makeStyles } from '@material-ui/core/styles'
import { useHref, useNavigate } from 'react-router'
import { Breadcrumbs, Dialog, IconButton, Link, Theme, Typography } from '@material-ui/core'
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

const AboutDialog = styled(Dialog)`
    padding: 0;
    overflow: hidden;
`

type FooterLinkBaseProps = React.PropsWithChildren<{ title?: string }>
type FooterLinkAnchorProps = FooterLinkBaseProps & { href: string }

function FooterLinkExternal(props: FooterLinkAnchorProps) {
    const classes = useStyles()
    return (
        <Link
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
            color="textPrimary"
            href={props.href}
            className={classes.footerLink}>
            <Typography variant="body2" component="span">
                {props.children}
            </Typography>
        </Link>
    )
}

type FooterLinkLinkProps = FooterLinkBaseProps & { to: string }
function FooterLinkTo(props: FooterLinkLinkProps) {
    const classes = useStyles()
    const href = useHref(props.to)
    const navigate = useNavigate()

    return (
        <Link
            underline="none"
            onClick={() => navigate(href)}
            href={href}
            color="textPrimary"
            className={classes.footerLink}>
            <Typography variant="body2" component="span">
                {props.children}
            </Typography>
        </Link>
    )
}

type FooterLinkAnchorButtonProps = FooterLinkBaseProps & { onClick(e: React.MouseEvent<HTMLAnchorElement>): void }
function FooterLinkButton(props: FooterLinkAnchorButtonProps) {
    const classes = useStyles()
    return (
        <Link
            underline="none"
            component="a"
            style={{ cursor: 'pointer' }}
            color="textPrimary"
            onClick={props.onClick}
            className={classes.footerLink}>
            <Typography variant="body2" component="span">
                {props.children}
            </Typography>
        </Link>
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
                <FooterLinkExternal href={links.MASK_OFFICIAL_WEBSITE}>Mask.io</FooterLinkExternal>
                <FooterLinkButton onClick={() => setOpen(true)}>{t.about()}</FooterLinkButton>
                <FooterLinkButton onClick={openVersionLink} title={process.env.VERSION}>
                    <Version />
                </FooterLinkButton>
                <FooterLinkExternal href={links.MOBILE_DOWNLOAD_LINK}>{t.dashboard_mobile_test()}</FooterLinkExternal>
                <FooterLinkExternal href={links.MASKBOOK_GITHUB}>{t.dashboard_source_code()}</FooterLinkExternal>
                <FooterLinkExternal href={links.BOUNTY_LIST}>{t.footer_bounty_list()}</FooterLinkExternal>
                <FooterLinkTo to={RoutePaths.PrivacyPolicy}>{t.privacy_policy()}</FooterLinkTo>
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
