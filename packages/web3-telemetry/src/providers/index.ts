import { env } from '@masknet/flags'
import { SentryAPI } from './Sentry.js'
import { MixpanelAPI } from './Mixpanel.js'

export const Sentry = new SentryAPI(env)
export const Mixpanel = new MixpanelAPI(env)
