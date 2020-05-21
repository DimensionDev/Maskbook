import React from 'react'
import { makeStyles, Typography, createStyles, Avatar, IconButton, Link } from '@material-ui/core'

import FacebookIcon from '@material-ui/icons/Facebook'
import TwitterIcon from '@material-ui/icons/Twitter'
import GitHubIcon from '@material-ui/icons/GitHub'
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
            background: 'url(/aboutDialogBackground.png) no-repeat center / cover',
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

export function DashboardAboutDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { version } = globalThis.browser?.runtime.getManifest() ?? {}
    return (
        <DashboardDialogCore {...props} CloseIconProps={{ className: classes.close }}>
            <section className={classes.wrapper}>
                <header className={classes.header}>
                    <Avatar className={classes.maskface} src="/MB--CircleCanvas--WhiteOverBlue.svg"></Avatar>
                    <img className={classes.masktext} src="/maskbook-title-white.svg" />
                    <Typography className={classes.version} variant="body2" color="inherit">
                        {t('version')} {version}
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
                                href="https://www.facebook.com/groups/324857694838456">
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
