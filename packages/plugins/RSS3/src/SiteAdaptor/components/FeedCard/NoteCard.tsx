import { Icons } from '@masknet/icons'
import { Image, Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveIPFS_URL, resolveResourceURL } from '@masknet/web3-shared-base'
import { Link, Typography } from '@mui/material'
import Linkify from 'linkify-react'
import { useCallback } from 'react'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { LinkifyOptions, htmlToPlain } from '../common.js'
import { NoteAction } from '../FeedActions/NoteAction.js'
import { useMarkdownStyles } from '../../hooks/index.js'

const useStyles = makeStyles<
    void,
    'title' | 'image' | 'content' | 'info' | 'body' | 'center' | 'playButton' | 'failedImage'
>()((theme, _, refs) => ({
    title: {
        fontWeight: 700,
        marginTop: theme.spacing(1),
        color: theme.palette.maskColor.main,
    },
    info: {},
    center: {
        display: 'flex',
        alignItems: 'center',
    },
    failedImage: {},
    soloImage: {
        // If only single image, place it center
        marginTop: theme.spacing(5),
        [`&.${refs.image}`]: {
            marginTop: theme.spacing(5),
        },
    },
    image: {
        [`& + .${refs.info}`]: {
            marginLeft: theme.spacing(1.5),
        },
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
        [`& + .${refs.info}`]: {
            marginLeft: theme.spacing(1.5),
        },
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
    verbose: {
        [`.${refs.title}`]: {
            lineHeight: '18px',
            marginBottom: theme.spacing(1.5),
        },
        [`.${refs.body}`]: {
            display: 'block',
        },
        [`.${refs.content}`]: {
            display: 'block',
            maxHeight: 'none',
            overflow: 'unset',
        },
        [`.${refs.image}`]: {
            width: '100%',
            marginTop: theme.spacing(1.5),
            height: 'auto',
            [`& + .${refs.info}`]: {
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
        [`.${refs.info}`]: {
            marginLeft: 0,
        },
        [`.${refs.playButton}`]: {
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isNoteFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.NoteFeed {
    return feed.tag === Tag.Social && [Type.Post, Type.Revise, Type.Mint].includes(feed.type)
}

interface NoteCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.NoteFeed
}

const cardTypeMap = {
    [Type.Mint]: CardType.NoteMint,
    [Type.Post]: CardType.NoteCreate,
    [Type.Revise]: CardType.NoteEdit,
    [Type.Share]: CardType.NoteLink,
} as const

function resolveDetailLink(metadata?: RSS3BaseAPI.PostMetadata, related_urls?: string[]) {
    if (!metadata) return null

    const { profile_id, publication_id } = metadata
    if (!profile_id || !publication_id || !related_urls?.length) return null

    const pubId = `${profile_id}-${publication_id}`
    return related_urls.find((x) => x.toLowerCase().endsWith(pubId))
}

/**
 * NoteCard
 * Including:
 *
 * - NoteMint
 * - NoteCreate
 * - NoteEdit
 */
export function NoteCard({ feed, className, ...rest }: NoteCardProps) {
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    // You might see a collectible action on a note minting feed
    const action = feed.actions.filter((x) => x.tag === Tag.Social)[0]
    const metadata = 'target' in action.metadata! ? action.metadata.target : action.metadata

    const type = action.type

    const imageSize = rest.verbose ? '100%' : 64
    const transformUri = useCallback(
        (uri: string) => {
            if (action.platform === 'Planet' && action.related_urls?.[0] && !uri.match(/^https?:\/\//))
                return `https://thumbor.rss3.dev/unsafe/${action.related_urls[0]}/${uri}`
            return resolveIPFS_URL(uri)!
        },
        [action.platform, action.related_urls?.[0]],
    )

    const media = metadata?.media?.[0]

    // Image post on Forcaster
    const isImagePost = metadata?.body ? /https?:\/\/.*?\.(jpg|png)$/.test(metadata.body) : false
    const soloImage = rest.verbose && isImagePost

    return (
        <CardFrame
            type={cardTypeMap[type]}
            feed={feed}
            className={cx(rest.verbose ? classes.verbose : null, className)}
            {...rest}>
            <NoteAction feed={feed} />
            <div className={classes.body}>
                {media?.mime_type.startsWith('image/') || isImagePost ?
                    <Image
                        classes={{
                            container: cx(classes.image, soloImage ? classes.soloImage : undefined),
                            failed: classes.failedImage,
                        }}
                        src={isImagePost ? metadata!.body : resolveResourceURL(media!.address)}
                        height={imageSize}
                        width={imageSize}
                    />
                : media?.mime_type.startsWith('video/') ?
                    <Link
                        className={classes.playButton}
                        href={resolveDetailLink(metadata, action.related_urls) || resolveResourceURL(media.address)}
                        target="_blank"
                        onClick={(evt) => evt.stopPropagation()}>
                        <Icons.Play size={64} />
                    </Link>
                :   null}
                <div className={cx(classes.info, metadata?.title || rest.verbose ? null : classes.center)}>
                    {metadata?.title ?
                        <Typography className={classes.title}>{metadata.title}</Typography>
                    :   null}
                    {isImagePost ?
                        null
                    : rest.verbose && metadata?.body ?
                        <Markdown className={mdClasses.markdown} defaultStyle={false} urlTransform={transformUri}>
                            {metadata.body}
                        </Markdown>
                    :   <Typography className={classes.content}>
                            <Linkify options={LinkifyOptions}>
                                {htmlToPlain(metadata?.summary || metadata?.body)}
                            </Linkify>
                        </Typography>
                    }
                </div>
            </div>
        </CardFrame>
    )
}
