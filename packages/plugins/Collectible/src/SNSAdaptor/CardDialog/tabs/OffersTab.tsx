import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import type { NonFungibleTokenOrder, Pageable } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { OffersListWrapper } from '../../Shared/OffersList.js'

export interface OffersTabProps {
    offers: AsyncStateRetry<Pageable<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
}

export function OffersTab(props: OffersTabProps) {
    return <OffersListWrapper offers={props.offers} />
}
