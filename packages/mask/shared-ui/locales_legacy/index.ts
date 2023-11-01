import { i18NextInstance } from '@masknet/shared-base'
import type { TFunction } from 'i18next'
import type en from '../locales/en-US.json'

declare let f: TFunction<any>
/** @deprecated Prefer useMaskTrans() */
export const i18n = i18NextInstance as {
    t: typeof f<keyof typeof en, {}, string>
}
