import { ValueRef } from '@dimensiondev/holoflows-kit'
import { ObservableWeakMap } from '@masknet/shared-base'
import { isEqual } from 'lodash-es'
import type { SocialNetworkUI } from '@masknet/types'
import { ThemeMode, FontSize } from '@masknet/web3-shared-base'

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
                size: FontSize.NORMAL,
                mode: ThemeMode.LIGHT,
                color: 'rgb(37, 99, 235)',
            },
            isEqual,
        ),
}
