import { createGlobalState } from '@masknet/shared'
import { Messages, Services } from '../../API'

export const [useCurrentCollectibleDataProvider] = createGlobalState(
    Services.Settings.getCurrentCollectibleDataProvider,
    (x) => Messages.events.currentNonFungibleAssetDataProviderSettings.on(x),
)

export const [useCurrentSelectedWalletNetwork] = createGlobalState(
    Services.Settings.getCurrentSelectedWalletNetwork,
    (x) => Messages.events.currentNetworkSettings.on(x),
)
