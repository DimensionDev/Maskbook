import { OffersListWrapper, type OffersListProps } from '../../Shared/OffersList.js'

interface OffersTabProps extends OffersListProps {}

export function OffersTab(props: OffersTabProps) {
    return <OffersListWrapper {...props} />
}
