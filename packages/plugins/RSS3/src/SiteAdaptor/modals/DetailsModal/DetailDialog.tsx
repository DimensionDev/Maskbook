import { Icons } from '@masknet/icons'
import { InjectedDialog, Linking, type InjectedDialogProps } from '@masknet/shared'
import { parseURL } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer, useReverseAddress } from '@masknet/web3-hooks-base'
import { Others } from '@masknet/web3-providers'
import { DialogContent, Typography } from '@mui/material'
import { useMemo, type PropsWithChildren } from 'react'
import { useRSS3Trans } from '../../../locales/index.js'
import type { FeedCardProps } from '../../components/base.js'
import { FeedCard } from '../../components/index.js'
import { hostIconMap, hostNameMap, type CardType } from '../../components/share.js'
import { FeedOwnerContext, type FeedOwnerOptions } from '../../contexts/index.js'

const useStyles = makeStyles()((theme) => ({
    detailsDialog: {
        width: 600,
        minHeight: 400,
        maxHeight: 620,
        backgroundImage: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: theme.spacing(3),
    },
    details: {
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        '::-webkit-scrollbar-thumb': {},
    },
    card: {
        flexGrow: 1,
    },
    links: {
        display: 'flex',
        gap: theme.spacing(1.5),
        marginTop: 'auto',
        flexShrink: 0,
        flexGrow: 0,
        paddingTop: theme.spacing(2),
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        height: 24,
        textDecoration: 'none',
        color: theme.palette.maskColor.highlight,
    },
    linkLabel: {
        fontSize: 18,
        fontWeight: 700,
        lineHeight: '22px',
        marginLeft: theme.spacing(1),
    },
}))

interface FeedDetailsDialogProps
    extends PropsWithChildren<InjectedDialogProps>,
        Pick<FeedCardProps, 'feed' | 'actionIndex'> {
    type: CardType
}

export function FeedDetailsDialog({ type, feed, onClose, actionIndex, ...rest }: FeedDetailsDialogProps) {
    const t = useRSS3Trans()
    const { classes } = useStyles()
    const links = feed.actions[0].related_urls

    const address = feed.owner || feed.address_from || feed.actions[0].address_from || ''
    const { data: reversedName } = useReverseAddress(undefined, address)
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const name = address ? getDomain(address) || reversedName : reversedName
    const feedOwner = useMemo((): FeedOwnerOptions => {
        return {
            address,
            name,
            ownerDisplay: name ? Others.formatDomainName(name) : Others.formatAddress(feed.owner, 4) ?? address,
        }
    }, [address, name, Others.formatDomainName, Others.formatAddress, feed.owner])

    return (
        <FeedOwnerContext.Provider value={feedOwner}>
            <InjectedDialog
                classes={{
                    paper: classes.detailsDialog,
                }}
                {...rest}
                title={t.details()}
                onClose={() => {
                    onClose?.()
                }}>
                <DialogContent className={classes.content}>
                    <div className={classes.details}>
                        <FeedCard className={classes.card} feed={feed} actionIndex={actionIndex} verbose />
                        {links?.length ? (
                            <div className={classes.links}>
                                {links.map((link, index) => {
                                    const url = parseURL(link)
                                    if (!url || !['http:', 'https:'].includes(url.protocol)) return null
                                    const Icon = hostIconMap[url.host] ?? Icons.SettingsLanguage
                                    const name = hostNameMap[url.host] ?? url.host
                                    return (
                                        <Linking key={index} LinkProps={{ className: classes.link }} href={link}>
                                            <Icon size={24} />
                                            <Typography className={classes.linkLabel}>{name}</Typography>
                                        </Linking>
                                    )
                                })}
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </InjectedDialog>
        </FeedOwnerContext.Provider>
    )
}
