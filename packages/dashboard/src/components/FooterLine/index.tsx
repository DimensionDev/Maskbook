import { memo, useState, type HTMLProps } from 'react'
import { styled, Breadcrumbs, Dialog, IconButton, Link, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { useDashboardI18N } from '../../locales/index.js'
import { About } from './About.js'
import { Version } from './Version.js'
import links from './links.json'

const useStyles = makeStyles()((theme) => ({
    navRoot: {
        padding: '40px 0',
    },
    ol: {
        justifyContent: 'space-around',
    },
    footerLink: {
        display: 'inline-flex',
        padding: theme.spacing(0.5),
        borderRadius: 0,
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
    },
    separator: {
        color: getMaskColor(theme).lineLight,
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(2.5),
        top: theme.spacing(1),
        color: theme.palette.text.secondary,
    },
}))

const AboutDialog = styled(Dialog)`
    padding: 0;
    overflow: hidden;
`

type FooterLinkBaseProps = React.PropsWithChildren<{
    title?: string
}>
type FooterLinkAnchorProps = FooterLinkBaseProps & {
    href: string
    onClick?(e: React.MouseEvent<HTMLAnchorElement>): void
}

function FooterLinkItem(props: FooterLinkAnchorProps) {
    const { classes } = useStyles()
    return (
        <Link
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
            color="textPrimary"
            href={props.href}
            onClick={props.onClick}
            className={classes.footerLink}>
            <Typography variant="body2" component="span">
                {props.children}
            </Typography>
        </Link>
    )
}

interface Props extends HTMLProps<HTMLDivElement> {}

export const FooterLine = memo((props: Props) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const [isOpen, setOpen] = useState(false)
    const version = process.env.VERSION

    const defaultVersionLink = `${links.DOWNLOAD_LINK_STABLE_PREFIX}/v${version}`
    const openVersionLink = (event: React.MouseEvent) => {
        // `MouseEvent.prototype.metaKey` on macOS (`Command` key), Windows (`Windows` key), Linux (`Super` key)
        if (process.env.channel === 'stable' && !event.metaKey) {
            openWindow(defaultVersionLink)
        } else {
            openWindow(`${links.DOWNLOAD_LINK_UNSTABLE_PREFIX}/${process.env.COMMIT_HASH}`)
        }
    }
    return (
        <div {...props}>
            <Breadcrumbs
                classes={{ separator: classes.separator, ol: classes.ol, root: classes.navRoot }}
                separator="|"
                aria-label="breadcrumb">
                <FooterLinkItem href={links.MASK_OFFICIAL_WEBSITE}>Mask.io</FooterLinkItem>
                <FooterLinkItem
                    href="https://mask.io/about"
                    onClick={(e) => {
                        e.preventDefault()
                        setOpen(true)
                    }}>
                    {t.about()}
                </FooterLinkItem>
                <FooterLinkItem href={defaultVersionLink} onClick={openVersionLink} title={process.env.VERSION}>
                    <Version />
                </FooterLinkItem>
                <FooterLinkItem href={links.MASK_GITHUB}>{t.dashboard_source_code()}</FooterLinkItem>
                <FooterLinkItem href={links.BOUNTY_LIST}>{t.footer_bounty_list()}</FooterLinkItem>
                <FooterLinkItem href={links.MASK_PRIVACY_POLICY}>{t.privacy_policy()}</FooterLinkItem>
            </Breadcrumbs>
            <AboutDialog open={isOpen} title="" onClose={() => setOpen(false)}>
                <About />
                <IconButton
                    size="large"
                    className={classes.closeButton}
                    onClick={() => setOpen(false)}
                    edge="end"
                    color="inherit">
                    <Close />
                </IconButton>
            </AboutDialog>
        </div>
    )
})
FooterLine.displayName = 'FooterLine'
