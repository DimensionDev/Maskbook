import { i18NextInstance } from '@masknet/shared-base'
import type en from '../locales/en-US.json'

// Deprecates. Prefer useMaskI18n()
export const i18n = i18NextInstance as {
    t: typeof i18NextInstance.t<keyof typeof en>
}
