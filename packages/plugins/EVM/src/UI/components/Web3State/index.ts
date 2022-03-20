import type { Web3Plugin } from '@masknet/plugin-infra'
import { AddressBookState } from './AddressBook'
import { NameServiceState } from './NameService'
import { TokenListState } from './TokenList'
import { createSharedState } from './Shared'
import { createUtilsState } from './Utils'

export async function createWeb3State(signal: AbortSignal): Promise<Web3Plugin.ObjectCapabilities.Capabilities> {
    return {
        AddressBook: new AddressBookState(),
        NameService: new NameServiceState(),
        TokenList: new TokenListState(),
        Shared: await createSharedState(),
        Utils: await createUtilsState(),
    }
}
