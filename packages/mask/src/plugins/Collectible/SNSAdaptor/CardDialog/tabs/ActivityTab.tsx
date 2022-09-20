import type { NonFungibleTokenEvent, Pageable } from '@masknet/web3-shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { ActivitiesList } from '../../Shared/ActivitiesList.js'

export interface ActivityTabProps {
    events: AsyncStateRetry<Pageable<NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
}

export function ActivityTab(props: ActivityTabProps) {
    return <ActivitiesList events={props.events} />
}
