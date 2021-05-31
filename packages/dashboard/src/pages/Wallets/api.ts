import { createGlobalState } from '@dimensiondev/maskbook-shared'
import { Messages, Services } from '../../API'

export const [useCurrentPortfolioDataProvider] = createGlobalState(
    Services.Settings.getCurrentPortfolioDataProvider,
    (x) => Messages.events.createInternalSettingsChanged.on(x),
)
