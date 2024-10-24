import { Icons } from '@masknet/icons'
import { Image, Markdown } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Social } from '@masknet/web3-providers/types'
import { Link, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { memo, type HTMLProps } from 'react'
import { formatTimestamp } from '../components/share.js'
import { SocialFeedDetailsModal } from '../modals/modals.js'
import { FeedSummary } from './FeedSummary.js'
import { useMarkdownStyles } from '../hooks/index.js'

const useStyles = makeStyles<void, 'image' | 'markdown' | 'failedImage' | 'body' | 'playButton' | 'verbose'>()(
    (theme, _, refs) => ({
        markdown: {},
        inspectable: {
            cursor: 'pointer',
            padding: theme.spacing(1.5),
            '&:hover': {
                backgroundColor: theme.palette.maskColor.bg,
            },
            [`.${refs.markdown}`]: {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
                '& *': {
                    display: 'contents',
                },
            },
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
        },
        timestamp: {
            fontSize: 14,
            fontWeight: 400,
            color: theme.palette.maskColor.third,
        },
        body: {
            display: 'flex',
            flexDirection: 'row',
            marginTop: theme.spacing(0.5),
            [`.${refs.image}`]: {
                width: 64,
                aspectRatio: '1 / 1',
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
            },
        },
        failedImage: {},
        soloImage: {
            // If only single image, place it center
            marginTop: theme.spacing(5),
            [`&.${refs.image}`]: {
                marginTop: theme.spacing(5),
            },
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
        image: {
            img: {
                objectFit: 'cover',
            },
            [`& + .${refs.markdown}`]: {
                marginLeft: theme.spacing(1.5),
            },
        },
        playButton: {
            color: theme.palette.maskColor.main,
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: theme.palette.maskColor.bg,
            [`& + .${refs.markdown}`]: {
                marginLeft: theme.spacing(1.5),
            },
        },
        verbose: {
            [`.${refs.body}`]: {
                flexDirection: 'column-reverse',
            },
            [`.${refs.image}`]: {
                width: '100%',
                marginTop: theme.spacing(1.5),
                height: 'auto',
                [`& + .${refs.markdown}`]: {
                    marginTop: theme.spacing(1.5),
                    marginLeft: 0,
                },
                aspectRatio: 'auto',
                img: {
                    objectFit: 'unset',
                },
            },
            [`.${refs.image}.${refs.failedImage}`]: {
                height: 100,
                width: 100,
                marginLeft: 'auto',
                marginRight: 'auto',
            },
            [`.${refs.markdown}`]: {
                marginLeft: 0,
            },
            [`.${refs.playButton}`]: {
                marginLeft: 'auto',
                marginRight: 'auto',
            },
        },

        // quoted post
        quoted: {
            marginBottom: theme.spacing(1),
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
                [`.${refs.markdown}`]: {
                    marginLeft: 0,
                    maxHeight: 'none',
                    display: 'block',
                },
            },
        },
        quotedPost: {
            display: 'flex',
            gap: theme.spacing(1.5),
        },
    }),
)

const PlatformIconMap = {
    [Social.Source.Farcaster]: Icons.Farcaster,
    [Social.Source.Lens]: Icons.Lens,
}

export interface SocialFeedProps extends HTMLProps<HTMLDivElement> {
    post: Social.Post
    verbose?: boolean
}
export const SocialFeed = memo<SocialFeedProps>(function SocialFeed({ post, verbose, className, ...rest }) {
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()
    const PlatformIcon = PlatformIconMap[post.source]
    const media = post.metadata.content?.asset
    const postContent = post.metadata.content?.content

    const isImagePost = postContent ? /https?:\/\/.*?\.(jpg|png)$/.test(postContent) : false
    const soloImage = verbose && isImagePost

    const imageSize = verbose ? '100%' : 64
    const target = post.type === 'Quote' ? post.quoteOn : null

    return (
        <article
            {...rest}
            className={cx(className, verbose ? classes.verbose : classes.inspectable)}
            onClick={() => {
                if (verbose) return
                SocialFeedDetailsModal.open({
                    post,
                })
            }}>
            <div className={classes.header}>
                {PlatformIcon ?
                    <PlatformIcon height={18} width="auto" />
                :   null}
                {post.timestamp ?
                    <ShadowRootTooltip
                        title={formatDateTime(new Date(post.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                        placement="right">
                        <Typography className={classes.timestamp}>{formatTimestamp(post.timestamp)}</Typography>
                    </ShadowRootTooltip>
                :   null}
            </div>
            {target ?
                <div className={classes.quoted}>
                    <FeedSummary className={classes.summary} post={target} mt={0.5} />
                    <div className={classes.quotedPost}>
                        <div className={classes.line} />
                        <article className={cx(classes.target, verbose ? classes.verbose : null)}>
                            {!verbose && target.metadata.content?.asset?.type === 'Image' ?
                                <Image
                                    classes={{ container: classes.image, failed: classes.failedImage }}
                                    src={target.metadata.content?.asset.uri}
                                    width={120}
                                    height={90}
                                />
                            :   null}
                            <div>
                                {target.metadata.content?.content ?
                                    <Markdown className={cx(mdClasses.markdown, classes.markdown)}>
                                        {target.metadata.content?.content}
                                    </Markdown>
                                :   null}
                            </div>
                            {verbose && target.metadata.content?.asset?.type === 'Image' ?
                                <Image
                                    classes={{ container: classes.image, failed: classes.failedImage }}
                                    src={target.metadata.content?.asset.uri}
                                    width="100%"
                                />
                            :   null}
                        </article>
                    </div>
                </div>
            :   null}
            <FeedSummary post={post} mt={0.5} />
            <div className={classes.body}>
                {media?.type === 'Image' ?
                    <Image
                        classes={{
                            container: cx(classes.image, soloImage ? classes.soloImage : undefined),
                            failed: classes.failedImage,
                        }}
                        src={media.uri}
                        height={imageSize}
                        width={imageSize}
                    />
                : media?.type === 'Video' ?
                    <Link
                        className={classes.playButton}
                        href={media.uri}
                        target="_blank"
                        onClick={(evt) => evt.stopPropagation()}>
                        <Icons.Play size={64} />
                    </Link>
                :   null}
                {post.metadata.content?.content ?
                    <Markdown defaultStyle={!verbose} className={classes.markdown}>
                        {post.metadata.content?.content}
                    </Markdown>
                :   null}
            </div>
        </article>
    )
})
