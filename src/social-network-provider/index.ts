import { twitterUI, twitterWorker } from './twitter.com'
import { facebookUI, facebookWorker } from './facebook.com'

export const uiList = [...twitterUI, ...facebookUI, import('./options-page')]

export const workerList = [...twitterWorker, ...facebookWorker]
