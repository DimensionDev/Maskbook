import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { LiquidityAction } from '../FeedActions/LiquidityAction.js'

const { Tag, Type } = RSS3BaseAPI
export function isLiquidityFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.LiquidityFeed {
    return feed.tag === Tag.Exchange && feed.type === Type.Liquidity
}

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.LiquidityFeed
}

/**
 * LiquidityCard.
 * Including:
 *
 * - TokenIn
 * - TokenOut
 * - UnknownBurn
 */
export function LiquidityCard({ feed, ...rest }: TokenFeedCardProps) {
    return (
        <CardFrame key={feed.id} type={CardType.TokenLiquidity} feed={feed} {...rest}>
            <LiquidityAction feed={feed} />
        </CardFrame>
    )
}
