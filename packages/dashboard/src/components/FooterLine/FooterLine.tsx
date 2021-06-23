import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Theme, Typography, Link as MuiLink } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'

const useStyles = makeStyles((theme: Theme) => ({
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
}))

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

export function FooterLine() {
    const t = useDashboardI18N()
    const classes = useStyles()
    // todo: fix type error
    // @ts-ignore
    const version = globalThis.browser?.runtime.getManifest()?.version ?? process.env.TAG_NAME.slice(1)
    const openVersionLink = (event: React.MouseEvent) => {
        // `MouseEvent.prototype.metaKey` on macOS (`Command` key), Windows (`Windows` key), Linux (`Super` key)
        if (process.env.build === 'stable' && event.metaKey === false) {
            open(`https://github.com/DimensionDev/Maskbook/releases/tag/v${version}`)
        } else {
            open(`https://github.com/DimensionDev/Maskbook/tree/${process.env.COMMIT_HASH}`)
        }
    }
    return (
        <>
            <Breadcrumbs className={classes.footerButtons} separator="-" aria-label="breadcrumb">
                <FooterLink href="https://mask.io">Mask.io</FooterLink>
                {/*<FooterLink onClick={openAboutDialog}>{t.about()}</FooterLink>*/}
                <FooterLink onClick={openVersionLink} title={process.env.VERSION}>
                    {process.env.build === 'stable'
                        ? t.version_of_stable({ version })
                        : t.version_of_unstable({
                              version,
                              build: process.env.build ?? '',
                              hash: process.env.COMMIT_HASH ?? '',
                          })}
                </FooterLink>
                <FooterLink href="https://mask.io/download-links/#mobile">{t.dashboard_mobile_test()}</FooterLink>
                <FooterLink href="https://github.com/DimensionDev/Maskbook">{t.dashboard_source_code()}</FooterLink>
                <FooterLink href="https://legal.mask.io/maskbook/">{t.privacy_policy()}</FooterLink>
            </Breadcrumbs>
            {/*{aboutDialog}*/}
        </>
    )
}
