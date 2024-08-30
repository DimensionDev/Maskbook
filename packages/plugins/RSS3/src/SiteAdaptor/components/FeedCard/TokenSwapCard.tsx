import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { TokenSwapAction } from '../FeedActions/TokenSwapAction.js'

const { Tag, Type } = RSS3BaseAPI
export function isTokenSwapFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenSwapFeed {
    return feed.tag === Tag.Exchange && feed.type === Type.Swap
}

interface TokenSwapCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenSwapFeed
}

/**
 * TokenSwapCard
 * Including:
 *
 * - TokenSwap
 */
export function TokenSwapCard({ feed, ...rest }: TokenSwapCardProps) {
    return (
        <CardFrame type={CardType.TokenSwap} feed={feed} {...rest}>
            <TokenSwapAction feed={feed} />
        </CardFrame>
    )
}
