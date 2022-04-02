import { i18NextInstance, TranslateOptions } from '@masknet/shared-base'
import type en from '../locales/en-US.json'

// Deprecates. Prefer useMaskI18n()
export const i18n = {
    t: ((key, options) => {
        return i18NextInstance.t(key, options)
    }) as I18NFunction,
}

export type I18NFunction = <TKeys extends keyof typeof en>(
    key: TKeys | TKeys[],
    // defaultValue?: string,
    options?: TranslateOptions | string,
) => typeof en[TKeys]
