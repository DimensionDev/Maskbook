import { DiscordIcon, MaskBlueIcon, MaskGreyIcon, MaskTextIcon, MaskTextNightlyIcon } from '@masknet/icons'
import { Avatar, IconButton, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import FacebookIcon from '@mui/icons-material/Facebook'
import GitHubIcon from '@mui/icons-material/GitHub'
import TelegramIcon from '@mui/icons-material/Telegram'
import TwitterIcon from '@mui/icons-material/Twitter'
import { useDashboardI18N } from '../../locales'
import { styled } from '@mui/material/styles'
import { Version } from './Version'
import { getMaskColor } from '@masknet/theme'
import links from './links.json'
import { ABOUT_DIALOG_BACKGROUND } from '../../assets'

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
    },
    maskface: {
        width: 120,
        height: 120,
        marginTop: 75,
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

        '& > p': {
            marginBottom: '36px',
        },
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
        color: getMaskColor(theme).iconLight,
        fontSize: '0.77rem',
        margin: theme.spacing(0, 2),
        padding: theme.spacing(2, 2, 3, 6),
    },
    link: {
        color: getMaskColor(theme).iconLight,
    },
}))

const IconContainer = styled('div')(`
    width: 100%;
    height: 100%;

    & > svg {
        width: 100%;
        height: 100%;
    }
`)

const TextIconContainer = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(1)} 0;
    width: 100px;

    & > svg {
        width: 100%;
        height: 100%;
    }
`,
)

const brands: Record<string, React.ReactNode> = {
    'https://www.facebook.com/masknetwork': <FacebookIcon />,
    'https://twitter.com/realMaskNetwork': <TwitterIcon />,
    'https://github.com/DimensionDev/Maskbook': <GitHubIcon />,
    'https://t.me/maskbook_group': <TelegramIcon />,
    'https://discord.gg/4SVXvj7': <DiscordIcon />,
}

const MaskIcon = () => (process.env.NODE_ENV === 'production' ? <MaskBlueIcon /> : <MaskGreyIcon />)
const MaskTitleIcon = () => (process.env.NODE_ENV === 'production' ? <MaskTextIcon /> : <MaskTextNightlyIcon />)

export function About() {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    return (
        <>
            <section className={classes.wrapper}>
                <header className={classes.header}>
                    <Avatar className={classes.maskface}>
                        <IconContainer>
                            <MaskIcon />
                        </IconContainer>
                    </Avatar>
                    <TextIconContainer>
                        <MaskTitleIcon />
                    </TextIconContainer>
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
