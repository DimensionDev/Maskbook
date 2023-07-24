import { Icons } from '@masknet/icons'
import { InjectedDialog, type InjectedDialogProps, Linking } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { DialogContent, Typography } from '@mui/material'
import { useMemo, type PropsWithChildren } from 'react'
import type { FeedCardProps } from '../../components/base.js'
import { hostIconMap, type CardType, hostNameMap } from '../../components/share.js'
import { useI18N } from '../../../locales/index.js'
import { FeedCard } from '../../components/index.js'
import { ScopedDomainsContainer, useReverseAddress } from '@masknet/web3-hooks-base'
import { FeedOwnerContext, type FeedOwnerOptions } from '../../contexts/index.js'
import { Others } from '@masknet/web3-providers'

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

export interface FeedDetailsDialogProps
    extends PropsWithChildren<InjectedDialogProps>,
        Pick<FeedCardProps, 'feed' | 'actionIndex'> {
    type: CardType
}

export function FeedDetailsDialog({ type, feed, onClose, actionIndex, ...rest }: FeedDetailsDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const links = feed.actions[0].related_urls

    const { data: reversedName, isLoading: loadingENS } = useReverseAddress(undefined, feed.owner)
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const name = feed.owner ? getDomain(feed.owner) || reversedName : reversedName
    const feedOwner = useMemo((): FeedOwnerOptions | undefined => {
        if (!feed.owner) return
        return {
            address: feed.owner,
            name,
            ownerDisplay: name ? Others.formatDomainName(name) : Others.formatAddress(feed.owner, 4) ?? feed.owner,
        }
    }, [feed.owner, name, Others.formatDomainName, Others.formatAddress])

    if (!feedOwner) return null
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
                                    let host = ''
                                    try {
                                        const url = new URL(link)
                                        if (!['http:', 'https:'].includes(url.protocol)) return null
                                        host = url.host
                                    } catch {}
                                    const Icon = hostIconMap[host] ?? Icons.SettingsLanguage
                                    const name = hostNameMap[host] ?? host
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
