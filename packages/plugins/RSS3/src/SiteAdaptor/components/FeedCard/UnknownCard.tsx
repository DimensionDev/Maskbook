import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useFeedOwner } from '../../contexts/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { UnknownAction } from '../FeedActions/UnknownAction.js'

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.Web3Feed
}

export function UnknownCard({ feed, ...rest }: TokenFeedCardProps) {
    const action = feed.actions[0]

    const owner = useFeedOwner()
    const isFromOwner = isSameAddress(owner.address, action?.from)

    const cardType = isFromOwner ? CardType.UnknownOut : CardType.UnknownIn

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <UnknownAction feed={feed} />
            {process.env.NODE_ENV === 'development' ?
                <Typography color="red">
                    Unknown feed. Tag: {feed.tag}, Type: {feed.type}, {feed.actions.length} actions
                </Typography>
            :   null}
        </CardFrame>
    )
}
