import type { PaletteMode } from '@material-ui/core'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI } from '../../../social-network'
import { SubscriptionFromValueRef } from '@masknet/shared'
import { isDarkTheme } from '../../../utils'

const palette = new ValueRef<PaletteMode>('light')
export const PaletteProviderFacebook: SocialNetworkUI.Customization.PaletteModeProvider = {
    start(signal) {
        const i = setInterval(() => {
            palette.value = isDarkTheme() ? 'dark' : 'light'
        }, 4000)
        signal.addEventListener('abort', () => clearInterval(i))
    },
    current: SubscriptionFromValueRef(palette),
}
