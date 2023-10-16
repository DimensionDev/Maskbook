import { CollectibleCard } from '../CollectibleCard.js'
import { OffersListWrapper, type OffersListProps } from '../../Shared/OffersList.js'

interface OffersTabProps extends OffersListProps {}

export function OffersTab(props: OffersTabProps) {
    return (
        <CollectibleCard>
            <OffersListWrapper {...props} />
        </CollectibleCard>
    )
}
