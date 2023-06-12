import { Icons } from '@masknet/icons'
import { Box, IconButton, Link, Typography } from '@mui/material'
import { makeStyles, getMaskColor } from '@masknet/theme'
import {
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
    Telegram as TelegramIcon,
    Twitter as TwitterIcon,
} from '@mui/icons-material'
import { useDashboardI18N } from '../../locales/index.js'
import { Version } from './Version.js'
import links from './links.json'
import { ABOUT_DIALOG_BACKGROUND } from '../../assets/index.js'
import type { ReactNode } from 'react'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: 580,
        minHeight: 660,
        lineHeight: 1.75,
    },
    header: {
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: `url(${ABOUT_DIALOG_BACKGROUND}) no-repeat center / cover`,
        paddingTop: 75,
    },
    version: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 12,
    },
    main: {
        fontSize: 16,
        textAlign: 'center',
        margin: '24px 68px 20px',

        '& > p': {
            marginBottom: '36px',
        },
    },
    getInTouch: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
    },
    icon: {
        color: theme.palette.text.primary,
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
        color: getMaskColor(theme).iconLight,
        fontSize: '0.77rem',
        margin: theme.spacing(0, 2),
        padding: theme.spacing(2, 2, 3, 6),
    },
    link: {
        color: getMaskColor(theme).iconLight,
    },
}))

const brands: Record<string, ReactNode> = {
    'https://www.facebook.com/masknetwork': <FacebookIcon />,
    'https://twitter.com/realMaskNetwork': <TwitterIcon />,
    'https://t.me/maskbook_group': <TelegramIcon />,
    'https://discord.gg/4SVXvj7': <Icons.Discord />,
    'https://github.com/DimensionDev/Maskbook': <GitHubIcon />,
}

const MaskIcon = () =>
    process.env.NODE_ENV === 'production' ? <Icons.MaskBlue size={120} /> : <Icons.MaskGrey size={120} />
const MaskTitleIcon = () =>
    process.env.NODE_ENV === 'production' ? (
        <Icons.MaskText width={190} height={28} />
    ) : (
        <Icons.MaskTextNightly width={190} height={28} />
    )

export function About() {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    return (
        <>
            <section className={classes.wrapper}>
                <header className={classes.header}>
                    <MaskIcon />
                    <Box pt="12px">
                        <MaskTitleIcon />
                    </Box>
                    <Version className={classes.version} />
                </header>
                <main className={classes.main}>
                    <Typography component="p" variant="inherit">
                        {t.about_dialog_description()}
                    </Typography>
                    <section className={classes.getInTouch}>
                        <Typography variant="inherit">{t.about_dialog_touch()}</Typography>
                        <div className={classes.brands}>
                            {Object.keys(brands).map((href, key) => (
                                <IconButton key={key} className={classes.icon} target="_blank" size="small" href={href}>
                                    {brands[href]}
                                </IconButton>
                            ))}
                        </div>
                    </section>
                </main>
                <footer className={classes.footer}>
                    <Typography component="p" variant="inherit">
                        <span>{t.about_dialog_feedback()}</span>
                        <Link classes={{ root: classes.link }} href={`mailto:${links.MASK_EMAIL}`}>
                            {links.MASK_EMAIL}
                        </Link>
                    </Typography>
                    <Typography component="p" variant="inherit">
                        <span>{t.about_dialog_source_code()}</span>
                        <Link classes={{ root: classes.link }} href={links.MASK_GITHUB}>
                            {links.MASK_GITHUB}
                        </Link>
                    </Typography>
                    <Typography component="p" variant="inherit">
                        {t.about_dialog_license()} GNU AGPL 3.0
                    </Typography>
                </footer>
            </section>
        </>
    )
}
