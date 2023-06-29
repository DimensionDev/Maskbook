import { isEqual } from 'lodash-es'
import { ValueRef, ObservableWeakMap, type ProfileInformation } from '@masknet/shared-base'
import type { SocialNetworkUI } from '@masknet/types'
import { ThemeMode, FontSize, ThemeColor, type ThemeSettings } from '@masknet/web3-shared-base'

export const stateCreator: {
    readonly [key in keyof SocialNetworkUI.AutonomousState]-?: () => SocialNetworkUI.AutonomousState[key]
} = {
    profiles: () => new ValueRef<ProfileInformation[]>([], isEqual),
}
export const creator = {
    EmptyIdentityResolveProviderState:
        (): SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'] => new ValueRef({}, isEqual),
    EmptyPostProviderState: (): SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'] =>
        new ObservableWeakMap(),
    EmptyThemeSettingsProviderState: (): SocialNetworkUI.CollectingCapabilities.ThemeSettingsProvider['recognized'] =>
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
