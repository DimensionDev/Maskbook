import { Image } from '@masknet/shared'
import { makeStyles, Markdown } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, FeedCardProps } from '../base.js'
import { CardType, transformPlanetResource } from '../share.js'
import { Label } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'

const useStyles = makeStyles<void, 'title' | 'image' | 'content' | 'info' | 'body' | 'center'>()((theme, _, refs) => ({
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
    },
    body: {
        display: 'flex',
        flexDirection: 'row',
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
        },
        [`.${refs.info}`]: {
            marginLeft: 0,
        },
    },
}))

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
export const NoteCard: FC<NoteCardProps> = ({ feed, className, ...rest }) => {
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    // You might see a collectible action on a note minting feed
    const action = feed.actions.filter((x) => x.tag === Tag.Social)[0]
    const metadata = 'target' in action.metadata! ? action.metadata.target : action.metadata

    const user = useAddressLabel(feed.owner)
    const type = action.type

    const imageSize = rest.verbose ? '100%' : 64

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
                {metadata?.media?.[0].mime_type.startsWith('image/') ? (
                    <Image
                        classes={{ container: classes.image }}
                        src={metadata.media[0].address}
                        height={imageSize}
                        width={imageSize}
                    />
                ) : null}
                <div className={cx(classes.info, metadata?.title || rest.verbose ? null : classes.center)}>
                    {metadata?.title ? <Typography className={classes.title}>{metadata.title}</Typography> : null}
                    {rest.verbose && metadata?.body ? (
                        <Markdown className={mdClasses.markdown}>
                            {action.platform === 'Planet' && action.related_urls?.[0]
                                ? transformPlanetResource(metadata.body, action.related_urls[0])
                                : metadata.body}
                        </Markdown>
                    ) : (
                        <Typography className={classes.content}>{metadata?.summary || metadata?.body}</Typography>
                    )}
                </div>
            </div>
        </CardFrame>
    )
}
