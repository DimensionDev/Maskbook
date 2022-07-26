import { isTwitter } from '../utils.js'
import { setupWatcherForTwitter } from './twitter.js'

if (isTwitter()) {
    setupWatcherForTwitter()
}
