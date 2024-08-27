import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useFeedOwner } from '../../contexts/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { TokenOperationAction } from '../FeedActions/TokenOperationAction.js'

const { Tag, Type } = RSS3BaseAPI
type Type = RSS3BaseAPI.Type
export function isTokenOperationFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenOperationFeed {
    const isTxTag =
        feed.tag === Tag.Transaction && [Type.Transfer, Type.Burn, Type.Mint, Type.Approval].includes(feed.type)
    const isExchangeTag = feed.tag === Tag.Exchange && [Type.Deposit, Type.Withdraw].includes(feed.type)
    return isTxTag || isExchangeTag
}

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenOperationFeed
}

const cardTypeMap: Partial<Record<RSS3BaseAPI.Type, CardType>> = {
    [Type.Burn]: CardType.TokenBurn,
    [Type.Mint]: CardType.TokenMint,
    [Type.Withdraw]: CardType.TokenIn,
    [Type.Deposit]: CardType.TokenOut,
}

/**
 * TokenOperationCard.
 * Including:
 *
 * - TokenMint
 * - TokenIn
 * - TokenOut
 * - TokenBurn
 */
export function TokenOperationCard({ feed, ...rest }: TokenFeedCardProps) {
    const action = feed.actions.find((x) => x.from && x.to) || feed.actions[0]

    const owner = useFeedOwner()
    const isFromOwner = isSameAddress(owner.address, action.from)

    const cardType = cardTypeMap[feed.type] || (isFromOwner ? CardType.TokenOut : CardType.TokenIn)

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <TokenOperationAction feed={feed} />
        </CardFrame>
    )
}
