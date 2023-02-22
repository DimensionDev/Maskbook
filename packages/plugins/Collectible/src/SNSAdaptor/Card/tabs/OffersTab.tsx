import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import { CollectibleCard } from '../CollectibleCard.js'
import { OffersListWrapper } from '../../Shared/OffersList.js'
import type { AsyncStatePageable } from '@masknet/web3-hooks-base'

export interface OffersTabProps {
    offers: AsyncStatePageable<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
}

export function OffersTab(props: OffersTabProps) {
    return (
        <CollectibleCard>
            <OffersListWrapper offers={props.offers} />
        </CollectibleCard>
    )
}
