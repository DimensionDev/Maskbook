import { Image, Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import Linkify from 'linkify-react'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { AddressLabel, LinkifyOptions, htmlToPlain } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'content' | 'failedImage'>()((theme, _, refs) => ({
    summary: {
        height: 20,
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre-wrap',
        gap: 6,
    },
    comment: {
        color: theme.palette.maskColor.main,
        marginTop: theme.spacing(1),
        fontSize: 14,
    },
    image: {},
    failedImage: {},
    verbose: {},
    quoted: {
        marginBottom: theme.spacing(1),
    },
    quotedPost: {
        display: 'flex',
        gap: theme.spacing(1.5),
    },
    line: {
        width: 1,
        borderLeft: `1px solid ${theme.palette.maskColor.line}`,
        marginLeft: 10,
    },
    target: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 0),
        color: theme.palette.maskColor.main,
        fontSize: 14,
        [`.${refs.image}`]: {
            width: 120,
            height: 90,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
            marginRight: theme.spacing(1.5),
        },
        [`&.${refs.verbose}`]: {
            display: 'block',
            [`.${refs.image}`]: {
                width: '100%',
                borderRadius: 8,
                marginTop: theme.spacing(1),
            },
            [`.${refs.image}.${refs.failedImage}`]: {
                height: 100,
                width: 100,
                marginLeft: 'auto',
                marginRight: 'auto',
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
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
        fontSize: 14,
        overflow: 'hidden',
        wordBreak: 'break-all',
    },
    collapse: {
        whiteSpace: 'pre-wrap',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
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
export function CommentCard({ feed, ...rest }: CommentCardProps) {
    const { verbose } = rest
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const commentTarget = metadata?.target

    return (
        <CardFrame type={CardType.NoteLink} feed={feed} {...rest}>
            {commentTarget ?
                <div className={classes.quoted}>
                    <Typography className={classes.summary}>
                        <RSS3Trans.note
                            values={{
                                user: commentTarget.handle,
                                platform: action.platform!,
                                context: 'post',
                            }}
                            components={{
                                user: <AddressLabel address={commentTarget.handle} />,
                            }}
                        />
                    </Typography>
                    <div className={classes.quotedPost}>
                        <div className={classes.line} />
                        <article className={cx(classes.target, verbose ? classes.verbose : null)}>
                            {!verbose && commentTarget?.media?.[0].mime_type?.startsWith('image/') ?
                                <Image
                                    classes={{ container: classes.image, failed: classes.failedImage }}
                                    src={resolveResourceURL(commentTarget.media[0].address)}
                                    width={120}
                                    height={90}
                                />
                            :   null}
                            <div>
                                {commentTarget?.title ?
                                    <Typography variant="h1" className={classes.title}>
                                        {commentTarget.title}
                                    </Typography>
                                :   null}
                                {verbose && commentTarget?.body ?
                                    <Markdown className={cx(mdClasses.markdown, classes.content)}>
                                        {commentTarget.body}
                                    </Markdown>
                                :   <Typography className={cx(classes.content, classes.collapse)}>
                                        <Linkify options={LinkifyOptions}>{htmlToPlain(commentTarget?.body)}</Linkify>
                                    </Typography>
                                }
                            </div>
                            {verbose && commentTarget?.media?.[0].mime_type?.startsWith('image/') ?
                                <Image
                                    classes={{ container: classes.image, failed: classes.failedImage }}
                                    src={resolveResourceURL(commentTarget.media[0].address)}
                                    width="100%"
                                />
                            :   null}
                        </article>
                    </div>
                </div>
            :   null}
            <Typography className={classes.summary}>
                <RSS3Trans.note
                    values={{
                        user: metadata?.handle!,
                        platform: action.platform!,
                        context: 'comment',
                    }}
                    components={{
                        user: <AddressLabel address={feed.owner} />,
                    }}
                />
            </Typography>
            <Typography className={classes.comment}>
                <Linkify options={LinkifyOptions}>{metadata?.body}</Linkify>
            </Typography>
        </CardFrame>
    )
}
