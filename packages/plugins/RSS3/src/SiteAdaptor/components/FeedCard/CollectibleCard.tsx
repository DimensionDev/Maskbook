import { Image } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress, resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useMemo } from 'react'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType, getLastAction } from '../share.js'
import { CollectibleAction } from '../FeedActions/CollectibleAction.js'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'info' | 'center' | 'failedImage'>()((theme, _, refs) => ({
    verbose: {},
    image: {
        img: {
            objectFit: 'cover',
        },
    },
    center: {},
    failedImage: {},
    soloImage: {
        // If only single image, place it center
        marginTop: theme.spacing(5),
    },
    body: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: theme.spacing(1.5),
        [`&.${refs.center}`]: {
            alignItems: 'center',
        },
        [`&.${refs.verbose}`]: {
            display: 'block',
            [`.${refs.image}`]: {
                width: 552,
                height: 'auto',
                aspectRatio: 'auto',
            },
            [`.${refs.image}.${refs.failedImage}`]: {
                height: 100,
                width: 100,
                marginLeft: 'auto',
                marginRight: 'auto',
            },
            [`.${refs.info}`]: {
                marginLeft: 0,
                marginTop: theme.spacing(1.5),
            },
        },
        [`.${refs.image}`]: {
            width: 64,
            height: 64,
            aspectRatio: '1 / 1',
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
        },
    },
    info: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        marginLeft: theme.spacing(1.5),
        overflow: 'auto',
    },
    title: {
        fontWeight: 700,
    },
    subtitle: {
        fontWeight: 400,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
    },
    attributes: {
        display: 'grid',
        marginTop: theme.spacing(1.5),
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridGap: theme.spacing(2, 2),
    },
    attribute: {
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'space-between',
        flexGrow: 0,
        flexShrink: 0,
        overflow: 'hidden',
    },
    attributeType: {
        color: theme.palette.maskColor.second,
        textTransform: 'uppercase',
        fontSize: 14,
        fontWeight: 400,
    },
    attributeValue: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isCollectibleFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.CollectibleFeed {
    return feed.tag === Tag.Collectible && [Type.Mint, Type.Trade, Type.Transfer, Type.Burn].includes(feed.type)
}

function isRegisteringENS(feed: RSS3BaseAPI.CollectibleFeed) {
    return feed.actions[1]?.platform === 'ENS Registrar'
}

interface CollectibleCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.CollectibleFeed
}

/**
 * CollectibleCard
 * Including:
 *
 * - CollectibleIn
 * - CollectibleBurn
 * - CollectibleIn
 * - CollectibleMint
 * - CollectibleOut
 */
export function CollectibleCard({ feed, ...rest }: CollectibleCardProps) {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const user = useAddressLabel(feed.owner)

    const { metadata, cardType } = useMemo(() => {
        let action
        let metadata
        switch (feed.type) {
            case Type.Mint:
                // If only one action, it should be free minting
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleMintFeed).metadata
                return {
                    cardType: CardType.CollectibleMint,
                    metadata,
                }
            case Type.Trade:
                action = getLastAction(feed as RSS3BaseAPI.CollectibleTradeFeed)
                metadata = action.metadata
                return {
                    cardType: CardType.CollectibleOut,
                    metadata,
                }
            case Type.Transfer:
                if (isRegisteringENS(feed)) {
                    return {
                        cardType: CardType.CollectibleIn,
                        metadata: feed.actions[1].metadata,
                    }
                }
                action = getLastAction(feed as RSS3BaseAPI.CollectibleTransferFeed)
                metadata = action.metadata
                const isSending = isSameAddress(feed.owner, action.from)
                return {
                    cardType: isSending ? CardType.CollectibleOut : CardType.CollectibleIn,
                    metadata,
                }
            case Type.Burn:
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleBurnFeed).metadata
                return {
                    cardType: CardType.CollectibleBurn,
                    metadata,
                }
        }

        return { cardType: CardType.CollectibleIn }
    }, [feed, user])

    const imageWidth = verbose ? '100%' : 64
    const imageHeight = verbose ? 'auto' : 64
    const attributes = metadata && 'attributes' in metadata ? metadata.attributes?.filter((x) => x.trait_type) : []
    const soloImage = verbose && !metadata?.description && !attributes?.length

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <CollectibleAction feed={feed} />
            {metadata ?
                <div
                    className={cx(classes.body, {
                        [classes.verbose]: verbose,
                        [classes.center]: !verbose && !metadata.description,
                    })}>
                    <Image
                        classes={{
                            container: cx(classes.image, soloImage ? classes.soloImage : undefined),
                            failed: classes.failedImage,
                        }}
                        src={resolveResourceURL(metadata.image)}
                        width={imageWidth}
                        height={imageHeight}
                    />
                    <div className={classes.info}>
                        {verbose ? null : <Typography className={classes.title}>{metadata.name}</Typography>}
                        {metadata.description ?
                            <Typography className={classes.subtitle}>{metadata.description}</Typography>
                        :   null}
                    </div>
                    {verbose && attributes?.length ?
                        <div className={classes.attributes}>
                            {attributes.map((attribute) => {
                                const value =
                                    Array.isArray(attribute.value) ?
                                        attribute.value.map((x) => x.uri).join('\n')
                                    :   attribute.value

                                return (
                                    <div className={classes.attribute} key={attribute.trait_type}>
                                        <Typography className={classes.attributeType}>
                                            {attribute.trait_type}
                                        </Typography>
                                        <TextOverflowTooltip title={value} as={ShadowRootTooltip}>
                                            <Typography className={classes.attributeValue}>{value}</Typography>
                                        </TextOverflowTooltip>
                                    </div>
                                )
                            })}
                        </div>
                    :   null}
                </div>
            :   null}
        </CardFrame>
    )
}
