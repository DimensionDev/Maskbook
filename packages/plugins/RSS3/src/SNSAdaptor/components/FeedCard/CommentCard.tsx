import { Image, Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import Linkify from 'linkify-react'
import { Translate, useI18N } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label, LinkifyOptions, htmlToPlain } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'

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
        color: theme.palette.maskColor.main,
        [`.${refs.image}`]: {
            width: 64,
            height: 64,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
            marginRight: theme.spacing(1.5),
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
    title: {
        fontSize: '16px',
        fontWeight: 700,
        margin: theme.spacing(0.5, 0),
    },
    content: {
        color: theme.palette.maskColor.main,
        whiteSpace: 'pre-wrap',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
        overflow: 'hidden',
        wordBreak: 'break-all',
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
export const CommentCard = ({ feed, ...rest }: CommentCardProps) => {
    const { verbose } = rest
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

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
            <Typography className={classes.comment}>
                <Linkify options={LinkifyOptions}>{metadata?.body}</Linkify>
            </Typography>
            <article className={cx(classes.target, verbose ? classes.verbose : null)}>
                {verbose ? <Typography className={classes.originalLabel}>{t.original()}</Typography> : null}
                {commentTarget?.media?.[0].mime_type?.startsWith('image/') ? (
                    <Image
                        classes={{ container: classes.image }}
                        src={resolveResourceURL(commentTarget.media[0].address)}
                        height={imageSize}
                        width={imageSize}
                    />
                ) : null}
                <div>
                    {commentTarget?.title ? (
                        <Typography variant="h1" className={classes.title}>
                            {commentTarget?.title}
                        </Typography>
                    ) : null}
                    {verbose && commentTarget?.body ? (
                        <Markdown defaultStyle={false} className={mdClasses.markdown}>
                            {commentTarget.body}
                        </Markdown>
                    ) : (
                        <Typography className={classes.content}>
                            <Linkify options={LinkifyOptions}>{htmlToPlain(commentTarget?.body)}</Linkify>
                        </Typography>
                    )}
                </div>
            </article>
        </CardFrame>
    )
}
