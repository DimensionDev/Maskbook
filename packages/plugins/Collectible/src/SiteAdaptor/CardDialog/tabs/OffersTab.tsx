import { OffersListWrapper, type OffersListProps } from '../../Shared/OffersList.js'

export interface OffersTabProps extends OffersListProps {}

export function OffersTab(props: OffersTabProps) {
    return <OffersListWrapper {...props} />
}
