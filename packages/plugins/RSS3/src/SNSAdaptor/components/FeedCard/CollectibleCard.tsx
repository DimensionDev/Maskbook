import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { FC, useMemo } from 'react'
import { Translate } from '../../../locales/i18n_generated'
import { useAddressLabel } from '../../hooks'
import { CardType } from '../share'
import { CardFrame, FeedCardProps } from '../base'
import { formatValue, Label } from './common'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'info'>()((theme, _, refs) => ({
    summary: {
        fontSize: '14px',
        color: theme.palette.maskColor.third,
    },
    verbose: {},
    image: {},
    body: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: theme.spacing(1.5),
        [`&.${refs.verbose}`]: {
            display: 'block',
            [`.${refs.image}`]: {
                width: '100%',
                height: '100%',
            },
            [`.${refs.info}`]: {
                marginLeft: 0,
                marginTop: theme.spacing(1.5),
            },
        },
        [`.${refs.image}`]: {
            width: 64,
            height: 64,
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
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isCollectibleFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.CollectibleFeed {
    return feed.tag === Tag.Collectible
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
export const CollectibleCard: FC<CollectibleCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const user = useAddressLabel(feed.owner)

    const { metadata, summary } = useMemo(() => {
        let metadata
        switch (feed.type) {
            case Type.Mint:
                metadata = (feed as RSS3BaseAPI.CollectibleMintFeed).actions[0].metadata
                return {
                    metadata,
                    summary: (
                        <Translate.collectible_mint
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                                cost_value: formatValue(metadata?.cost),
                                cost_symbol: metadata?.cost?.symbol ?? '',
                                context: metadata?.cost ? 'cost' : 'no_cost',
                            }}
                            components={{
                                user: <Label />,
                                cost: <Label />,
                                collectible: verbose ? <Label /> : <span />,
                            }}
                        />
                    ),
                }
            case Type.Trade:
                metadata = (feed as RSS3BaseAPI.CollectibleTradeFeed).actions[0].metadata
                return {
                    metadata,
                    summary: (
                        <Translate.collectible_trade
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                                recipient: formatEthereumAddress(feed.actions[0].address_to ?? '', 4),
                                cost_value: formatValue(metadata?.cost),
                                cost_symbol: metadata?.cost?.symbol ?? '',
                            }}
                            components={{
                                user: <Label />,
                                recipient: <Label />,
                                cost: <Label />,
                                collectible: verbose ? <Label /> : <span />,
                            }}
                        />
                    ),
                }
            case Type.Transfer:
                if (isRegisteringENS(feed)) {
                    return {
                        metadata: feed.actions[1].metadata,
                        summary: (
                            <Translate.collectible_register_ens
                                values={{
                                    user,
                                    ens: verbose ? feed.actions[1].metadata!.name : 'an ENS',
                                    cost_value: formatValue(
                                        (feed.actions[0] as RSS3BaseAPI.CollectibleTransferAction).metadata,
                                    ),
                                    cost_symbol: feed.actions[0].metadata?.symbol ?? '',
                                }}
                                components={{
                                    user: <Label />,
                                    cost: <Label />,
                                    ens: verbose ? <Label /> : <span />,
                                }}
                            />
                        ),
                    }
                }
                metadata = (feed as RSS3BaseAPI.CollectibleTransferFeed).actions[0].metadata
                return {
                    metadata,
                    summary: (
                        <Translate.collectible_send
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                                recipient: formatEthereumAddress(feed.actions[0].address_to ?? '', 4),
                            }}
                            components={{
                                user: <Label />,
                                recipient: <Label />,
                                collectible: verbose ? <Label /> : <span />,
                            }}
                        />
                    ),
                }
            case Type.Burn:
                metadata = (feed as RSS3BaseAPI.CollectibleBurnFeed).actions[0].metadata
                return {
                    metadata,
                    summary: (
                        <Translate.collectible_burn
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                            }}
                            components={{
                                user: <Label />,
                                collectible: verbose ? <Label /> : <span />,
                            }}
                        />
                    ),
                }
        }

        return { summary: '' }
    }, [feed, user])

    const imageSize = verbose ? '100%' : 64

    return (
        <CardFrame type={CardType.TokenSwap} feed={feed} {...rest}>
            <Typography className={classes.summary}>{summary}</Typography>
            {metadata ? (
                <div className={cx(classes.body, verbose ? classes.verbose : null)}>
                    <Image
                        classes={{ container: classes.image }}
                        src={metadata.image}
                        height={imageSize}
                        width={imageSize}
                    />
                    <div className={classes.info}>
                        {verbose ? null : <Typography className={classes.title}>{metadata.name}</Typography>}
                        <Typography className={classes.subtitle}>{metadata.description}</Typography>
                    </div>
                    {verbose && 'attributes' in metadata && metadata.attributes?.length ? (
                        <div className={classes.attributes}>
                            {metadata.attributes.map((attribute) => (
                                <div className={classes.attribute} key={attribute.trait_type}>
                                    <Typography className={classes.attributeType}>{attribute.trait_type}</Typography>
                                    <Typography className={classes.attributeValue}>{attribute.value}</Typography>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </CardFrame>
    )
}
