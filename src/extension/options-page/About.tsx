import React from 'react'
import { Dialog, makeStyles, Typography, createStyles, Avatar } from '@material-ui/core'
import { useBlurContext } from './index'

import FacebookIcon from '@material-ui/icons/Facebook'
import TwitterIcon from '@material-ui/icons/Twitter'
import GitHubIcon from '@material-ui/icons/GitHub'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            width: '580px',
            lineHeight: 1.75,
            borderRadius: '12px',
        },
        header: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'url(/aboutDialogBackground.png) repeat-x center / contain',
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
            padding: theme.spacing(3, 8),
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
            color: theme.palette.text.secondary,
            borderTop: '1px solid #F5F5F5',
            fontSize: '0.77rem',
            padding: theme.spacing(2, 4, 3, 8),
        },
    }),
)

type DashboardAboutDialogProps = { open: boolean; onClose(): void }

export function DashboardAboutDialog({ open, onClose }: DashboardAboutDialogProps) {
    const classes = useStyles()
    const { version } = globalThis?.browser.runtime.getManifest()
    useBlurContext(open)
    return (
        <Dialog open={open} onClose={onClose} BackdropProps={{ invisible: true }}>
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
        </Dialog>
    )
}
