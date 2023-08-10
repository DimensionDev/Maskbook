import type { NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { AsyncStatePageable } from '@masknet/web3-hooks-base'
import { ActivitiesList } from '../../Shared/ActivitiesList.js'

export interface ActivitiesTabProps {
    events: AsyncStatePageable<NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
}

export function ActivitiesTab(props: ActivitiesTabProps) {
    return <ActivitiesList events={props.events} />
}
