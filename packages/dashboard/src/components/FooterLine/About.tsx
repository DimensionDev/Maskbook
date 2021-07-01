import { MaskBlueIcon, MaskGreyIcon, MaskTextIcon, MaskTextNightlyIcon } from '@masknet/icons'
import { Avatar, IconButton, Link, makeStyles, SvgIcon, SvgIconProps, Typography } from '@material-ui/core'
import FacebookIcon from '@material-ui/icons/Facebook'
import GitHubIcon from '@material-ui/icons/GitHub'
import TelegramIcon from '@material-ui/icons/Telegram'
import TwitterIcon from '@material-ui/icons/Twitter'
import { useDashboardI18N } from '../../locales'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Version } from './Version'
import { getMaskColor } from '@masknet/theme'

const useStyles = makeStyles((theme) => ({
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
        background: `url(${new URL('./AboutDialogBackground.png', import.meta.url)}) no-repeat center / cover`,
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
    a: {
        color: getMaskColor(theme).iconLight,
    },
}))

const IconContainer = styled('div')(
    ({ theme }) => `
    width: 100%;
    height: 100%;

    & > svg {
        width: 100%;
        height: 100%;
    }
`,
)
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

const DiscordIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
            <path d="M395 151s-40-31-88-35l-4 8c43 11 63 26 83 44-35-18-70-35-131-35s-96 17-131 35c20-18 44-35 83-44l-5-8c-49 5-87 35-87 35s-45 65-53 193c46 52 114 52 114 52l15-19c-25-8-52-24-76-51 28 21 71 44 140 44s112-22 140-44c-23 27-51 43-75 51l14 19s69 0 114-52c-8-128-53-193-53-193zM198 309c-17 0-31-16-31-35s14-36 31-36 31 16 31 36-14 35-31 35zm114 0c-17 0-31-16-31-35s14-36 31-36 31 16 31 36-14 35-31 35z" />
        </svg>
    </SvgIcon>
)

const brands: Record<string, React.ReactNode> = {
    'https://www.facebook.com/masknetwork': <FacebookIcon />,
    'https://twitter.com/realmaskbook': <TwitterIcon />,
    'https://github.com/DimensionDev/Maskbook': <GitHubIcon />,
    'https://t.me/maskbook_group': <TelegramIcon />,
    'https://discord.gg/4SVXvj7': <DiscordIcon />,
}

const MaskIcon = () => (process.env.NODE_ENV === 'production' ? <MaskBlueIcon /> : <MaskGreyIcon />)
const MaskTitleIcon = () => (process.env.NODE_ENV === 'production' ? <MaskTextIcon /> : <MaskTextNightlyIcon />)

export function About() {
    const classes = useStyles()
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
                        <Link classes={{ root: classes.a }} href={'mailto:info@dimension.im'}>
                            info@dimension.im
                        </Link>
                    </Typography>
                    <Typography component="p" variant="inherit">
                        <span>{t.about_dialog_source_code()}</span>
                        <Link classes={{ root: classes.a }} href={'https://github.com/DimensionDev/Maskbook'}>
                            https://github.com/DimensionDev/Maskbook
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
