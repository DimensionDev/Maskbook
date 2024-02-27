import { env } from '@masknet/flags'
if (process.env.NODE_ENV === 'production') console.log(env)
