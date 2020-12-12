import { makeStyles, Typography, createStyles, Avatar, IconButton, Link } from '@material-ui/core'

import FacebookIcon from '@material-ui/icons/Facebook'
import TwitterIcon from '@material-ui/icons/Twitter'
import GitHubIcon from '@material-ui/icons/GitHub'
import TelegramIcon from '@material-ui/icons/Telegram'
import { DashboardDialogCore, WrappedDialogProps } from './Base'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            width: 580,
            height: 660,
            lineHeight: 1.75,
        },
        header: {
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'url(/about-dialog-background.png) no-repeat center / cover',
        },
        maskface: {
            width: 120,
            height: 120,
            marginTop: 75,
        },
        masktext: {
            marginTop: 20,
            marginBottom: 20,
        },
        version: {
            color: '#FFF',
            fontSize: 12,
            marginBottom: 20,
        },
        main: {
            fontSize: 16,
            textAlign: 'center',
            margin: '24px 68px',
        },
        getInTouch: {
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 28,
        },
        icon: {
            color: theme.palette.text.primary,
        },
        close: {
            color: '#FFF',
        },
        brands: {
            marginTop: theme.spacing(1),
            '& > *': {
                margin: theme.spacing(0, 1),
                cursor: 'pointer',
            },
        },
        footer: {
            borderTop: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.secondary,
            fontSize: '0.77rem',
            margin: theme.spacing(0, 2),
            padding: theme.spacing(2, 2, 3, 6),
        },
    }),
)

const DiscordIcon = () => (
    <svg fill="none" width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M-1-1h582v402H-1z" />
        <circle r="256" cy="255.1" cx="254.2" />
        <path
            stroke="null"
            fill="#FFFFFF"
            d="M395 151s-40-31-88-35l-4 8c43 11 63 26 83 44-35-18-70-35-131-35s-96 17-131 35c20-18 44-35 83-44l-5-8c-49 5-87 35-87 35s-45 65-53 193c46 52 114 52 114 52l15-19c-25-8-52-24-76-51 28 21 71 44 140 44s112-22 140-44c-23 27-51 43-75 51l14 19s69 0 114-52c-8-128-53-193-53-193zM198 309c-17 0-31-16-31-35s14-36 31-36 31 16 31 36-14 35-31 35zm114 0c-17 0-31-16-31-35s14-36 31-36 31 16 31 36-14 35-31 35z"
        />
    </svg>
)

export function DashboardAboutDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const version = globalThis.browser?.runtime.getManifest()?.version ?? process.env.TAG_NAME.slice(1)
    return (
        <DashboardDialogCore {...props} CloseIconProps={{ className: classes.close }}>
            <section className={classes.wrapper}>
                <header className={classes.header}>
                    <Avatar className={classes.maskface} src="/MB--CircleCanvas--WhiteOverBlue.svg"></Avatar>
                    <img className={classes.masktext} src="/maskbook-title-white.svg" />
                    <Typography className={classes.version} variant="body2" color="inherit">
                        {t(process.env.build === 'stable' ? 'version_of_stable' : 'version_of_unstable', {
                            version,
                            build: process.env.build,
                            hash: process.env.COMMIT_HASH,
                        })}
                    </Typography>
                </header>
                <main className={classes.main}>
                    <Typography component="p" variant="inherit">
                        {t('about_dialog_description')}
                    </Typography>
                    <section className={classes.getInTouch}>
                        <Typography variant="inherit">{t('about_dialog_touch')}</Typography>
                        <div className={classes.brands}>
                            <IconButton
                                className={classes.icon}
                                target="_blank"
                                size="small"
                                href="https://www.facebook.com/masknetwork">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton
                                className={classes.icon}
                                target="_blank"
                                size="small"
                                href="https://twitter.com/realmaskbook">
                                <TwitterIcon />
                            </IconButton>
                            <IconButton
                                className={classes.icon}
                                target="_blank"
                                size="small"
                                href="https://github.com/DimensionDev/Maskbook">
                                <GitHubIcon />
                            </IconButton>
                            <IconButton
                                className={classes.icon}
                                target="_blank"
                                size="small"
                                href="https://t.me/maskbook_group">
                                <TelegramIcon />
                            </IconButton>
                            <IconButton
                                className={classes.icon}
                                target="_blank"
                                size="small"
                                href="https://discord.gg/4SVXvj7">
                                <DiscordIcon />
                            </IconButton>
                        </div>
                    </section>
                </main>
                <footer className={classes.footer}>
                    <Typography component="p" variant="inherit">
                        <span>{t('about_dialog_feedback')}</span>
                        <Link href={`mailto:${t('dashboard_email_address')}`}>{t('dashboard_email_address')}</Link>
                    </Typography>
                    <Typography component="p" variant="inherit">
                        <span>{t('about_dialog_source_code')}</span>
                        <Link href={t('dashboard_source_code_link')}>{t('dashboard_source_code_link')}</Link>
                    </Typography>
                    <Typography component="p" variant="inherit">
                        {t('about_dialog_license')} {t('dashboard_license')}
                    </Typography>
                </footer>
            </section>
        </DashboardDialogCore>
    )
}
