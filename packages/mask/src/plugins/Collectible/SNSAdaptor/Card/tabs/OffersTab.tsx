import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { NonFungibleTokenOrder, Pageable } from '@masknet/web3-shared-base'
import { CollectibleCard } from '../CollectibleCard.js'
import { OffersList } from '../../Shared/OffersList.js'

export interface OffersTabProps {
    offers: AsyncStateRetry<Pageable<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
}

export function OffersTab(props: OffersTabProps) {
    return (
        <CollectibleCard>
            <OffersList offers={props.offers} />
        </CollectibleCard>
    )
}
