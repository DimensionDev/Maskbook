import { Image, Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveIPFS_URL, resolveResourceURL } from '@masknet/web3-shared-base'
import { Link, Typography } from '@mui/material'
import { useCallback } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label, LinkifyOptions, htmlToPlain } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'
import { Icons } from '@masknet/icons'
import Linkify from 'linkify-react'

const useStyles = makeStyles<void, 'title' | 'image' | 'content' | 'info' | 'body' | 'center' | 'playButton'>()(
    (theme, _, refs) => ({
        summary: {
            color: theme.palette.maskColor.third,
        },
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
                width: 552,
                marginTop: theme.spacing(1.5),
                [`& + .${refs.info}`]: {
                    marginTop: theme.spacing(1.5),
                    marginLeft: 0,
                },
                aspectRatio: 'auto',
                img: {
                    objectFit: 'unset',
                },
            },
            [`.${refs.info}`]: {
                marginLeft: 0,
            },
            [`.${refs.playButton}`]: {
                marginLeft: 'auto',
                marginRight: 'auto',
            },
        },
    }),
)

const { Tag, Type } = RSS3BaseAPI
export function isNoteFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.NoteFeed {
    return feed.tag === Tag.Social && [Type.Post, Type.Revise, Type.Mint, Type.Share].includes(feed.type)
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

/**
 * NoteCard
 * Including:
 *
 * - NoteMint
 * - NoteCreate
 * - NoteEdit
 * - NoteLink
 */
export const NoteCard = ({ feed, className, ...rest }: NoteCardProps) => {
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    // You might see a collectible action on a note minting feed
    const action = feed.actions.filter((x) => x.tag === Tag.Social)[0]
    const metadata = 'target' in action.metadata! ? action.metadata.target : action.metadata

    const user = useAddressLabel(feed.owner)
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

    return (
        <CardFrame
            type={cardTypeMap[type]}
            feed={feed}
            className={cx(rest.verbose ? classes.verbose : null, className)}
            {...rest}>
            <Typography className={classes.summary}>
                <Translate.note
                    values={{
                        user,
                        platform: action.platform!,
                        context: type,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            <div className={classes.body}>
                {media?.mime_type.startsWith('image/') ? (
                    <Image
                        classes={{ container: classes.image }}
                        src={resolveResourceURL(media.address)}
                        height={imageSize}
                        width={imageSize}
                    />
                ) : media?.mime_type.startsWith('video/') ? (
                    <Link
                        className={classes.playButton}
                        href={resolveResourceURL(media.address)}
                        target="_blank"
                        onClick={(evt) => evt.stopPropagation()}>
                        <Icons.Play size={64} />
                    </Link>
                ) : null}
                <div className={cx(classes.info, metadata?.title || rest.verbose ? null : classes.center)}>
                    {metadata?.title ? <Typography className={classes.title}>{metadata.title}</Typography> : null}
                    {rest.verbose && metadata?.body ? (
                        <Markdown
                            className={mdClasses.markdown}
                            defaultStyle={false}
                            transformLinkUri={transformUri}
                            transformImageUri={transformUri}>
                            {metadata.body}
                        </Markdown>
                    ) : (
                        <Typography className={classes.content}>
                            <Linkify options={LinkifyOptions}>
                                {htmlToPlain(metadata?.summary || metadata?.body)}
                            </Linkify>
                        </Typography>
                    )}
                </div>
            </div>
        </CardFrame>
    )
}
