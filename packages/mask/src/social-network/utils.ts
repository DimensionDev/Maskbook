import { isEqual } from 'lodash-es'
import { ValueRef, ObservableWeakMap } from '@masknet/shared-base'
import type { SocialNetworkUI } from '@masknet/types'
import { ThemeMode, FontSize, ThemeColor } from '@masknet/web3-shared-base'

export const stateCreator: {
    readonly [key in keyof SocialNetworkUI.AutonomousState]-?: () => SocialNetworkUI.AutonomousState[key]
} = {
    profiles: () => new ValueRef([]),
}
export const creator = {
    EmptyIdentityResolveProviderState:
        (): SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'] => new ValueRef({}, isEqual),
    EmptyPostProviderState: (): SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'] =>
        new ObservableWeakMap(),
    EmptyThemeSettingsProviderState: (): SocialNetworkUI.CollectingCapabilities.ThemeSettingsProvider['recognized'] =>
        new ValueRef(
            {
                size: FontSize.Normal,
                mode: ThemeMode.Light,
                color: ThemeColor.Blue,
                isDim: false,
            },
            isEqual,
        ),
}
