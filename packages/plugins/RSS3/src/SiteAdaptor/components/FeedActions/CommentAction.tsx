import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { type FeedCardProps } from '../base.js'
import { AccountLabel } from '../common.js'
import { Trans } from '@lingui/react/macro'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface CommentActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.CommentFeed
}

/**
 * CommentAction
 * Including:
 *
 * - NoteLink
 */
export function CommentAction({ feed, ...rest }: CommentActionProps) {
    const { classes, cx } = useStyles()

    return (
        <div {...rest} className={cx(rest.className, classes.actions)}>
            {feed.actions.map((action, index) => {
                const metadata = action.metadata
                const user = metadata?.handle ?? 'Unknown'
                const platform = action.platform!
                return (
                    <Typography className={classes.summary} key={index} component="div">
                        <Trans>
                            <AccountLabel address={metadata?.handle}>{user}</AccountLabel> made a comment on {platform}
                        </Trans>
                    </Typography>
                )
            })}
        </div>
    )
}
