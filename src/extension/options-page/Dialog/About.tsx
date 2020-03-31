import React from 'react'
import { makeStyles, Typography, createStyles, Avatar } from '@material-ui/core'

import FacebookIcon from '@material-ui/icons/Facebook'
import TwitterIcon from '@material-ui/icons/Twitter'
import GitHubIcon from '@material-ui/icons/GitHub'
import { DashboardDialogCore, WrappedDialogProps } from './Base'

const useStyles = makeStyles((theme) =>
    createStyles({
        closeIcon: {
            color: 'white',
        },
        wrapper: {
            width: '580px',
            lineHeight: 1.75,
        },
        header: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'url(/aboutDialogBackground.png) no-repeat center / cover',
        },
        maskface: {
            width: '120px',
            height: '120px',
            marginTop: '75px',
        },
        masktext: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        version: {
            color: '#FFF',
            fontSize: '0.625rem',
            marginBottom: theme.spacing(2),
        },
        main: {
            margin: theme.spacing(3, 8),
            textAlign: 'center',
        },
        getInTouch: {
            fontWeight: 'bold',
            marginTop: theme.spacing(2),
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
    const { version } = globalThis?.browser.runtime.getManifest()
    return (
        <DashboardDialogCore {...props} closeIconColor="#FFF">
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
                        {
                            // TODO!: link
                        }
                        <div className={classes.brands}>
                            <FacebookIcon />
                            <TwitterIcon />
                            <GitHubIcon />
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
