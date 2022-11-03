import { Icons } from '@masknet/icons'
import { InjectedDialog, InjectedDialogProps, Linking } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { DialogContent, Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { useI18N } from '../../../locales'
import type { FeedCardProps } from '../base'
import { FeedCard } from '../FeedCard'
import { CardType, hostIconMap, hostNameMap } from '../share'

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
    },
    linkLabel: {
        fontSize: 18,
        fontWeight: 700,
        lineHeight: '22px',
        marginLeft: theme.spacing(1),
        color: theme.palette.maskColor.highlight,
    },
}))

export interface FeedDetailsDialogProps
    extends PropsWithChildren<InjectedDialogProps>,
        Pick<FeedCardProps, 'feed' | 'action'> {
    type: CardType
    onSubmit?(): void
}

export function FeedDetailsDialog({ type, feed, onClose, action, onSubmit, ...rest }: FeedDetailsDialogProps) {
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
                <FeedCard feed={feed} action={action} verbose />
                {links?.length ? (
                    <div className={classes.links}>
                        {links.map((link, index) => {
                            let host = ''
                            try {
                                host = new URL(link).host
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
            </DialogContent>
        </InjectedDialog>
    )
}
