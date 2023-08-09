import type { NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CollectibleCard } from '../CollectibleCard.js'
import { ActivitiesList } from '../../Shared/ActivitiesList.js'
import type { AsyncStatePageable } from '@masknet/web3-hooks-base'

export interface ActivitiesTabProps {
    events: AsyncStatePageable<NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
}

export function ActivitiesTab(props: ActivitiesTabProps) {
    return (
        <CollectibleCard>
            <ActivitiesList events={props.events} />
        </CollectibleCard>
    )
}
