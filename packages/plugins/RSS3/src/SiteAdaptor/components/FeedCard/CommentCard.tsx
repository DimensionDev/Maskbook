import { Image, Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import Linkify from 'linkify-react'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { AccountLabel, LinkifyOptions, htmlToPlain } from '../common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'content' | 'failedImage'>()((theme, _, refs) => ({
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
    comment: {
        color: theme.palette.maskColor.main,
        marginTop: theme.spacing(1),
        fontSize: 14,
        wordBreak: 'break-word',
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
                height: 'auto',
                borderRadius: 8,
                marginRight: 0,
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
        wordBreak: 'break-word',
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
    return feed.tag === Tag.Social && (feed.type === Type.Comment || feed.type === Type.Share)
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

    const target = metadata?.target

    return (
        <CardFrame type={CardType.NoteLink} feed={feed} {...rest}>
            {target ?
                <div className={classes.quoted}>
                    <Typography className={classes.summary} component="div">
                        <Trans>
                            <AccountLabel address={target.handle} handle={target.handle} children={target.handle} />{' '}
                            publish a post on {action.platform}
                        </Trans>
                    </Typography>
                    <div className={classes.quotedPost}>
                        <div className={classes.line} />
                        <article className={cx(classes.target, verbose ? classes.verbose : null)}>
                            {!verbose && target?.media?.[0].mime_type?.startsWith('image/') ?
                                <Image
                                    classes={{ container: classes.image, failed: classes.failedImage }}
                                    src={resolveResourceURL(target.media[0].address)}
                                    width={120}
                                    height={90}
                                />
                            :   null}
                            <div>
                                {target?.title ?
                                    <Typography variant="h1" className={classes.title}>
                                        {target.title}
                                    </Typography>
                                :   null}
                                {verbose && target?.body ?
                                    <Markdown className={cx(mdClasses.markdown, classes.content)}>
                                        {target.body}
                                    </Markdown>
                                :   <Typography className={cx(classes.content, classes.collapse)}>
                                        <Linkify options={LinkifyOptions}>{htmlToPlain(target?.body)}</Linkify>
                                    </Typography>
                                }
                            </div>
                            {verbose && target?.media?.[0].mime_type?.startsWith('image/') ?
                                <Image
                                    classes={{ container: classes.image, failed: classes.failedImage }}
                                    src={resolveResourceURL(target.media[0].address)}
                                    width="100%"
                                />
                            :   null}
                        </article>
                    </div>
                </div>
            :   null}
            <Typography className={classes.summary} component="div">
                {/* eslint-disable-next-line react/naming-convention/component-name */}
                <RSS3Trans.note
                    values={{
                        user: metadata?.handle ?? 'unknown',
                        platform: action.platform!,
                        context: action.type,
                    }}
                    components={{
                        user: <AccountLabel address={feed.owner} handle={metadata?.handle} />,
                    }}
                />
            </Typography>
            <Typography className={classes.comment}>
                <Linkify options={LinkifyOptions}>{metadata?.body}</Linkify>
            </Typography>
        </CardFrame>
    )
}
