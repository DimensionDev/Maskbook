import { isEqual } from 'lodash-es'
import { ValueRef, ObservableWeakMap, type ProfileInformation } from '@masknet/shared-base'
import type { SiteAdaptorUI } from '@masknet/types'
import { ThemeMode, FontSize, ThemeColor, type ThemeSettings } from '@masknet/web3-shared-base'

export const stateCreator: {
    readonly [key in keyof SiteAdaptorUI.AutonomousState]-?: () => SiteAdaptorUI.AutonomousState[key]
} = {
    profiles: () => new ValueRef<readonly ProfileInformation[]>([], isEqual),
}
export const creator = {
    EmptyIdentityResolveProviderState: (): SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'] =>
        new ValueRef({}, isEqual),
    EmptyPostProviderState: (): SiteAdaptorUI.CollectingCapabilities.PostsProvider['posts'] => new ObservableWeakMap(),
    EmptyThemeSettingsProviderState: (): SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider['recognized'] =>
        new ValueRef<ThemeSettings>(
            {
                size: FontSize.Normal,
                mode: ThemeMode.Light,
                color: ThemeColor.Blue,
                isDim: false,
            },
            isEqual,
        ),
}
