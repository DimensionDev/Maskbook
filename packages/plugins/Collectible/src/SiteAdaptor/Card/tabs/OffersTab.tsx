import { CollectibleCard } from '../CollectibleCard.js'
import { OffersListWrapper, type OffersListProps } from '../../Shared/OffersList.js'

export interface OffersTabProps extends OffersListProps {}

export function OffersTab(props: OffersTabProps) {
    return (
        <CollectibleCard>
            <OffersListWrapper {...props} />
        </CollectibleCard>
    )
}
