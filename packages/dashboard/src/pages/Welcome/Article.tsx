import { Icons } from '@masknet/icons'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { HTMLProps } from 'react'
import { useAsync } from 'react-use'
import { Services } from '../../API.js'

const useStyles = makeStyles()((theme) => ({
    article: {
        width: 600,
        margin: '0 auto',
    },
    h1: {
        margin: theme.spacing(4.5, 0),
        fontWeight: 500,
        fontSize: 24,
        lineHeight: '30px',
        textAlign: 'center',
    },
    h2: {
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.maskColor.main,
    },
    p: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
    },
    list: {
        marginTop: theme.spacing(2),
        paddingLeft: 0,
        marginLeft: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(3),
    },
    listItem: {
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        listStyleType: 'none',
        paddingLeft: 0,
        marginLeft: 0,
        display: 'flex',
        alignItems: 'center',
    },
    siteName: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '20px',
        marginLeft: theme.spacing(1),
    },
}))

const Permissions = () => {
    const { classes } = useStyles()
    const { value: sites = [] } = useAsync(() => {
        return Services.SiteAdaptor.getSitesWithoutPermission()
    }, [])

    if (!sites.length) return null

    return (
        <>
            <Typography className={classes.h2} variant="h2" mt="16px">
                Mask Network requires authorization for the following domains in order to provide comprehensive
                services.
            </Typography>

            <ul className={classes.list}>
                {sites.map(({ networkIdentifier, name }) => {
                    const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[networkIdentifier] ?? Icons.Globe
                    return (
                        <li className={classes.listItem} key={networkIdentifier}>
                            <Icon size={20} />
                            <Typography component="span" className={classes.siteName}>
                                {name}
                            </Typography>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export const Article = (props: HTMLProps<HTMLElement>) => {
    const { classes, cx } = useStyles()

    return (
        <article {...props} className={cx(classes.article, props.className)}>
            <Typography variant="h1" className={classes.h1}>
                Help Us Improve Mask Network
            </Typography>
            <Typography className={classes.p} mt="35px">
                Mask Network aims to build an encrypted and decentralized social network, so you (all Internet users)
                could send or browse encrypted posts with the 'Mask Network' extension or App. To improve our product,
                we will need your help.
            </Typography>
            <Typography variant="h2" className={classes.h2} mt="24px">
                Mask Network never collects
            </Typography>
            <Typography className={classes.p} mt="24px">
                Users' identity private keys, backup passwords, wallet payment passwords, wallet private keys, mnemonic
                phrases, keystores.
                <br />
                Users' related information and browsing histories of their social accounts.
                <br />
                Users' addresses, balances, purchase histories, hash, or any personal information.
                <br />
                Users' complete IP address.
                <br />
                <br />
                Mask Network keeps users' encrypted information in users'; browser, please keep it safe and make sure to
                back up constantly.
            </Typography>
            <Permissions />
        </article>
    )
}
