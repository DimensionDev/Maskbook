import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { type FeedCardProps } from '../base.js'
import { AccountLabel } from '../common.js'

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
                return (
                    <Typography className={classes.summary} key={index} component="div">
                        {/* eslint-disable-next-line react/naming-convention/component-name */}
                        <RSS3Trans.note
                            values={{
                                user: metadata?.handle ?? 'Unknown',
                                platform: action.platform!,
                                context: 'comment',
                            }}
                            components={{
                                user: <AccountLabel address={metadata?.handle} />,
                            }}
                        />
                    </Typography>
                )
            })}
        </div>
    )
}
