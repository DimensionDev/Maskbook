import { createI18NHooksNS } from '../../../utils/i18n-next-ui'
import { createPluginMessage } from '../../utils/createPluginMessage'
import { createPluginRPC, createPluginRPCGenerator } from '../../utils/createPluginRPC'
import { identifier as id } from '../constants'
export * from './date'

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(id)
export const PluginFileServiceRPC = createPluginRPC(id, () => import('../service'), PluginFileServiceMessage.events._)
export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    () => import('../service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage.events._2,
)
export const useI18NFileService = createI18NHooksNS<typeof import('../locales/en.json')>(id)
