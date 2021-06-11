import { createGlobalState } from '@dimensiondev/maskbook-shared'
import { Messages, Services } from '../../API'

export const [useCurrentPortfolioDataProvider] = createGlobalState(
    Services.Settings.getCurrentPortfolioDataProvider,
    (x) => Messages.events.createInternalSettingsChanged.on(x),
)

export const [useCurrentCollectibleDataProvider] = createGlobalState(
    Services.Settings.getCurrentCollectibleDataProvider,
    (x) => Messages.events.createInternalSettingsChanged.on(x),
)

export const [useCurrentSelectedWalletNetwork] = createGlobalState(
    Services.Settings.getCurrentSelectedWalletNetwork,
    (x) => Messages.events.createInternalSettingsChanged.on(x),
)
