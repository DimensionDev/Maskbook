import type { Web3Plugin } from '@masknet/plugin-infra'
import { Asset } from './Asset'
import { NameService } from './NameService'
import { createSharedState } from './Shared'
import { createUtilsState } from './Utils'

export async function createWeb3State(signal: AbortSignal): Promise<Web3Plugin.ObjectCapabilities.Capabilities> {
    return {
        Asset: new Asset(),
        NameService: new NameService(),
        Shared: await createSharedState(),
        Utils: await createUtilsState(),
    }
}
