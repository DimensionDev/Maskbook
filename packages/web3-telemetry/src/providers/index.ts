import { env } from '@masknet/flags'
import { SentryAPI } from './Sentry.js'

export const Sentry = new SentryAPI(env)
