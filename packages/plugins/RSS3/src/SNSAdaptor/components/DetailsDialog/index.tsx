import { Icons } from '@masknet/icons'
import { InjectedDialog, InjectedDialogProps, Linking } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { DialogContent, Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { FeedCard } from '../FeedCard'
import type { CardType, FeedCardProps } from '../FeedCard/base'

const useStyles = makeStyles()((theme) => ({
    confirmDialog: {
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
    const { classes } = useStyles()
    const links = feed.actions[0].related_urls
    return (
        <InjectedDialog
            classes={{
                paper: classes.confirmDialog,
            }}
            {...rest}
            title="Details"
            onClose={() => {
                onClose?.()
                onSubmit?.()
            }}>
            <DialogContent className={classes.content}>
                <FeedCard feed={feed} action={action} verbose disableFee={false} />
                {links?.length ? (
                    <div className={classes.links}>
                        {links.map((link, index) => (
                            <Linking key={index} LinkProps={{ className: classes.link }} href={link}>
                                <Icons.PolygonScan size={24} />
                                <Typography className={classes.linkLabel}>Polygonscan</Typography>
                            </Linking>
                        ))}
                    </div>
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
