import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { TokenBridgeAction } from '../FeedActions/TokenBridgeAction.js'

const { Tag, Type } = RSS3BaseAPI
export function isTokenBridgeFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenBridgeFeed {
    return feed.tag === Tag.Transaction && feed.type === Type.Bridge
}

interface TokenBridgeCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenBridgeFeed
}

/**
 * TokenBridgeCard
 * Including:
 *
 * - TokenBridge
 */
export function TokenBridgeCard({ feed, ...rest }: TokenBridgeCardProps) {
    return (
        <CardFrame type={CardType.TokenBridge} feed={feed} {...rest}>
            <TokenBridgeAction feed={feed} />
        </CardFrame>
    )
}
