import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import Markdown from 'react-markdown'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, FeedCardProps } from '../base.js'
import { Label } from './common.js'

const useStyles = makeStyles<void, 'content'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    title: {
        marginTop: theme.spacing(1),
        color: theme.palette.maskColor.main,
    },
    content: {
        marginTop: theme.spacing(1),
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        maxHeight: 80,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
        wordBreak: 'break-all',
    },
    markdown: {
        wordBreak: 'break-all',
        img: {
            maxWidth: '100%',
        },
    },
    verbose: {
        [`.${refs.content}`]: {
            display: 'block',
            maxHeight: 'none',
            overflow: 'unset',
        },
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isNoteFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.NoteFeed {
    return feed.tag === Tag.Social && [Type.Post, Type.Revise].includes(feed.type)
}

interface NoteCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.NoteFeed
}

/**
 * NoteCard
 * Including:
 *
 * - NoteCreate
 * - NoteEdit
 */
export const NoteCard: FC<NoteCardProps> = ({ feed, className, ...rest }) => {
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const isCreatingNote = feed.type === Type.Post

    return (
        <CardFrame
            type={isCreatingNote ? CardType.NoteCreate : CardType.NoteEdit}
            feed={feed}
            className={cx(rest.verbose ? classes.verbose : null, className)}
            {...rest}>
            <Typography className={classes.summary}>
                <Translate.note
                    values={{
                        user,
                        platform: action.platform!,
                        context: isCreatingNote ? 'add' : 'revise',
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {metadata?.title ? <Typography className={classes.title}>{metadata.title}</Typography> : null}
            {rest.verbose && metadata?.body ? (
                <Markdown className={classes.markdown}>{metadata.body}</Markdown>
            ) : (
                <Typography className={classes.content}>{metadata?.body}</Typography>
            )}
        </CardFrame>
    )
}
