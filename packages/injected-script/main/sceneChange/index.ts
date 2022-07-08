import { isTwitter } from '../utils'
import { setupWatcherForTwitter } from './twitter'

function setupWatcher() {
    if (isTwitter()) {
        setupWatcherForTwitter()
    }
}

setupWatcher()
