import type { Plugin } from '@masknet/plugin-infra/content-script'

export const SharedContext: { value: Plugin.SNSAdaptor.SNSAdaptorContext | undefined } = { value: undefined }
