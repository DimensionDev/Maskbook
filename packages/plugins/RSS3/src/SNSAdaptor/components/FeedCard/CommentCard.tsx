import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import Markdown from 'react-markdown'
import { Translate, useI18N } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label } from './common.js'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'content'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    comment: {
        color: theme.palette.maskColor.main,
    },
    image: {},
    verbose: {},
    target: {
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(1),
        borderRadius: 8,
        marginTop: theme.spacing(1.5),
        [`.${refs.image}`]: {
            width: 64,
            height: 64,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
        },
        [`&.${refs.verbose}`]: {
            display: 'block',
            [`.${refs.image}`]: {
                width: '100%',
                height: '100%',
                borderRadius: 8,
                marginTop: theme.spacing(1),
            },
            [`.${refs.content}`]: {
                marginLeft: 0,
                maxHeight: 'none',
                display: 'block',
            },
        },
    },
    originalLabel: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
    markdown: {
        wordBreak: 'break-all',
        img: {
            maxWidth: '100%',
        },
    },
    content: {
        color: theme.palette.maskColor.main,
        whiteSpace: 'pre-wrap',
        marginLeft: theme.spacing(1.5),
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
        overflow: 'hidden',
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isCommentFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.CommentFeed {
    return feed.tag === Tag.Social && feed.type === Type.Comment
}

interface CommentCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.CommentFeed
}

/**
 * CommentCard
 * Including:
 *
 * - NoteLink
 */
export const CommentCard: FC<CommentCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const t = useI18N()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const commentTarget = metadata?.target

    const imageSize = verbose ? '100%' : 64

    return (
        <CardFrame type={CardType.NoteLink} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.note
                    values={{
                        user,
                        platform: action.platform!,
                        context: 'comment',
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            <Typography className={classes.comment}>{metadata?.body}</Typography>
            <div className={cx(classes.target, verbose ? classes.verbose : null)}>
                {verbose ? <Typography classes={classes.originalLabel}>{t.original()}</Typography> : null}
                {commentTarget?.media?.[0].mime_type?.startsWith('image/') ? (
                    <Image
                        classes={{ container: classes.image }}
                        src={commentTarget.media[0].address}
                        height={imageSize}
                        width={imageSize}
                    />
                ) : null}
                {verbose && commentTarget?.body ? (
                    <Markdown className={classes.markdown}>{commentTarget.body}</Markdown>
                ) : (
                    <Typography className={classes.content}>{commentTarget?.body}</Typography>
                )}
            </div>
        </CardFrame>
    )
}
