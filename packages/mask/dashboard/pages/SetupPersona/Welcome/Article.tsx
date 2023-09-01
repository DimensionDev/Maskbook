import { Icons } from '@masknet/icons'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { HTMLProps } from 'react'
import { useAsync } from 'react-use'
import Services from '#services'
import { sortBy } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    article: {},
    h2: {
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.maskColor.main,
    },
    p: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        marginTop: 24,
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

function Permissions() {
    const { classes } = useStyles()
    const { value: sites = [] } = useAsync(() => {
        return Services.SiteAdaptor.getSitesWithoutPermission()
    }, [])

    if (!sites.length) return null

    return (
        <>
            <Typography className={classes.h2} variant="h2" mt="24px">
                Please grant us permission for these websites.
            </Typography>

            <ul className={classes.list}>
                {sortBy(sites, (x) => x.sortIndex).map(({ networkIdentifier, name }) => {
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

interface Props extends HTMLProps<HTMLDivElement> {}

export function Article({ className, ...rest }: Props) {
    const { classes, cx } = useStyles()

    return (
        <article className={cx(classes.article, className)} {...rest}>
            <Typography className={classes.p}>
                Mask Network aims to build an encrypted and decentralized social network, so you (all Internet users)
                could send or browse encrypted posts with the 'Mask Network' extension or APP.
            </Typography>
            <Typography className={classes.p}>
                We provide services for digital encrypted identity and crypto wallet.
            </Typography>
            <Typography className={classes.p} component="div">
                The Mask is a browser extension that our product's functions. For example,
                <ul>
                    <li>Setting an NFT avatar in social media,</li>
                    <li>Searching for cryptocurrency or artwork related to Twitter,</li>
                    <li>Getting information enhancement on Twitter,</li>
                    <li>Donating to Gitcoin and voting in Snapshot on the Twitter timeline,</li>
                    <li>Viewing information about assets and artwork related to certain social accounts.</li>
                </ul>
            </Typography>
            <Permissions />
        </article>
    )
}
