import React from 'react'
import { makeStyles, Typography, createStyles, Avatar, IconButton } from '@material-ui/core'

import FacebookIcon from '@material-ui/icons/Facebook'
import TwitterIcon from '@material-ui/icons/Twitter'
import GitHubIcon from '@material-ui/icons/GitHub'
import { DashboardDialogCore, WrappedDialogProps } from './Base'

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
    const classes = useStyles()
    const { version } = globalThis.browser?.runtime.getManifest() ?? {}
    return (
        <DashboardDialogCore {...props} CloseIconProps={{ className: classes.close }}>
            <section className={classes.wrapper}>
                <header className={classes.header}>
                    <Avatar className={classes.maskface} src="/MB--CircleCanvas--WhiteOverBlue.svg"></Avatar>
                    <img className={classes.masktext} src="/maskbook-title-white.svg" />
                    <Typography className={classes.version} variant="body2" color="inherit">
                        Version {version}
                    </Typography>
                </header>
                <main className={classes.main}>
                    <Typography component="p" variant="inherit">
                        Maskbook allows you to publish encrypted posts on social networks, so that you may mitigate the
                        big data surveillance from the big corporations. Only you and your friends (who are also using
                        Maskbook) can decrypt your encrypted posts.
                    </Typography>
                    <section className={classes.getInTouch}>
                        <Typography variant="inherit">Get in touch</Typography>
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
                        Feedback: info@dimension.im
                    </Typography>
                    <Typography component="p" variant="inherit">
                        Source code: https://github.com/DimensionDev/Maskbook
                    </Typography>
                    <Typography component="p" variant="inherit">
                        License: GNU AGPL 3.0
                    </Typography>
                </footer>
            </section>
        </DashboardDialogCore>
    )
}
