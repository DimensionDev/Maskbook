import { isTwitter } from '../utils'
import { setupWatcherForTwitter } from './twitter'

if (isTwitter()) {
    setupWatcherForTwitter()
}
