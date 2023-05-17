import { Icons } from '@masknet/icons'
import { InjectedDialog, type InjectedDialogProps, Linking } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { DialogContent, Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { useI18N } from '../../../locales/index.js'
import type { FeedCardProps } from '../base.js'
import { FeedCard } from '../FeedCard/index.js'
import { type CardType, hostIconMap, hostNameMap } from '../share.js'

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
    onSubmit?(): void
}

export function FeedDetailsDialog({ type, feed, onClose, actionIndex, onSubmit, ...rest }: FeedDetailsDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const links = feed.actions[0].related_urls
    return (
        <InjectedDialog
            classes={{
                paper: classes.detailsDialog,
            }}
            {...rest}
            title={t.details()}
            onClose={() => {
                onClose?.()
                onSubmit?.()
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
    )
}
