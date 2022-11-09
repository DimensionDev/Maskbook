import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { markdownTransformIpfsURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import Markdown from 'react-markdown'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'

const useStyles = makeStyles<void, 'title' | 'image' | 'content' | 'info' | 'body' | 'center'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    title: {
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
            fontWeight: 700,
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
    return feed.tag === Tag.Social && [Type.Post, Type.Revise, Type.Mint].includes(feed.type)
}

interface NoteCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.NoteFeed
}

const cardTypeMap = {
    [Type.Mint]: CardType.NoteEdit,
    [Type.Post]: CardType.NoteCreate,
    [Type.Revise]: CardType.NoteEdit,
} as const

const i18nContextMap = {
    [Type.Mint]: 'mint',
    [Type.Post]: 'add',
    [Type.Revise]: 'revise',
} as const

/**
 * NoteCard
 * Including:
 *
 * - NoteCreate
 * - NoteEdit
 */
export const NoteCard: FC<NoteCardProps> = ({ feed, className, ...rest }) => {
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const type = feed.type

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
                        context: i18nContextMap[type],
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
                        <Markdown className={mdClasses.markdown}>{markdownTransformIpfsURL(metadata.body)}</Markdown>
                    ) : (
                        <Typography className={classes.content}>{metadata?.body}</Typography>
                    )}
                </div>
            </div>
        </CardFrame>
    )
}
