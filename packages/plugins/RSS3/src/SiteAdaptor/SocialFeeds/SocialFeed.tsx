import { Icons } from '@masknet/icons'
import { Image, Markdown } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Social } from '@masknet/web3-providers/types'
import { Link, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { memo, type HTMLProps } from 'react'
import { Trans, Select } from '@lingui/macro'
import { formatTimestamp } from '../components/share.js'
import { Label } from '../components/common.js'

const useStyles = makeStyles<void, 'image'>()((theme, _, refs) => ({
    feed: {
        cursor: 'pointer',
        padding: theme.spacing(1.5),
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
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
    },
}))

const PlatformIconMap = {
    [Social.Source.Farcaster]: Icons.Farcaster,
    [Social.Source.Lens]: Icons.Lens,
}

interface Props extends HTMLProps<HTMLDivElement> {
    post: Social.Post
}
export const SocialFeed = memo<Props>(function SocialFeed({ post, className, ...rest }) {
    const { classes, cx } = useStyles()
    const PlatformIcon = PlatformIconMap[post.source]
    const handle = post.author.fullHandle || post.author.handle
    const media = post.metadata.content?.asset
    return (
        <article {...rest} className={cx(classes.feed, className)}>
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
            <Typography className={classes.summary}>
                <Select
                    value={post.type}
                    _Post={
                        <Trans>
                            <Label>{handle}</Label> published a post on <Label>{post.source}</Label>
                        </Trans>
                    }
                    _Comment={
                        <Trans>
                            <Label>{handle}</Label> made a comment on <Label>{post.source}</Label>
                        </Trans>
                    }
                    other={
                        <Trans>
                            <Label>{handle}</Label> post stuff on <Label>{post.source}</Label>
                        </Trans>
                    }
                />
            </Typography>
            <div className={classes.body}>
                {media?.type === 'Image' ?
                    <Image
                        classes={{
                            container: classes.image,
                        }}
                        src={media.uri}
                        height={64}
                        width={64}
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
                    <Markdown>{post.metadata.content?.content}</Markdown>
                :   null}
            </div>
        </article>
    )
})
