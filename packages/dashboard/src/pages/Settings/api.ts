import { createGlobalState } from '@dimensiondev/maskbook-shared'
import { Services, Messages, TypeTransform } from '../../API'

export const [useLanguage] = createGlobalState(Services.Settings.getLanguage, (x) =>
    Messages.events.createInternalSettingsChanged.on(x),
)

export const [useTrendingDataSource] = createGlobalState(Services.Settings.getTrendingDataSource, (x) =>
    Messages.events.createInternalSettingsChanged.on(x),
)

export const [useAncientPostsCompatibilityMode] = createGlobalState(
    Services.Settings.getAncientPostsCompatibiltyMode,
    (x) => Messages.events.createInternalSettingsChanged.on(x),
)

const { UpgradeBackupJSONFile, decompressBackupFile } = TypeTransform

export function getJSON(str: string) {
    return UpgradeBackupJSONFile(decompressBackupFile(str))
}
