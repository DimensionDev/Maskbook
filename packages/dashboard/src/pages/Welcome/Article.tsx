import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { FC, HTMLProps } from 'react'
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
        ['&::before']: {
            content: '"\u00B7"',
            color: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            width: '1em',
        },
    },
}))

const formatOrigins = (origins: string[]) => {
    const hosts = origins.map((origin) => {
        try {
            return decodeURIComponent(new URL(origin).host)
        } catch {
            return origin
        }
    })
    return hosts.join(', ')
}

const Permissions: FC = () => {
    const { classes } = useStyles()
    const { value: originGroups = EMPTY_LIST } = useAsync(() => {
        return Services.SiteAdaptor.getOriginsWithoutPermission()
    }, [])

    if (!originGroups.length) return null

    return (
        <>
            <Typography className={classes.h2} variant="h2" mt="16px">
                Mask network requires authorization for the following domains in order to provide comprehensive
                services.
            </Typography>

            <ul className={classes.list}>
                {originGroups.map(({ networkIdentifier, origins }) => (
                    <li className={classes.listItem} key={networkIdentifier}>
                        {formatOrigins(origins)}
                    </li>
                ))}
            </ul>
        </>
    )
}

interface Props extends HTMLProps<HTMLDivElement> {}

export const Article: FC<Props> = ({ className, ...rest }) => {
    const { classes, cx } = useStyles()

    return (
        <article className={cx(classes.article, className)} {...rest}>
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
                phrases, keystores. Users' related information and browsing histories of their social accounts. Users'
                addresses, balances, purchase histories, hash, or any personal information. Users' complete IP address.
                Mask Network keeps users' encrypted information in users'; browser, please keep it safe and make sure to
                back up constantly.
            </Typography>
            <Permissions />
        </article>
    )
}
