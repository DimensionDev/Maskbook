import { injectPostDialogAtTwitter } from './PostDialog'
import { injectPostDialogHintAtTwitter } from './PostDialogHint'

export function injectPostBoxComposed(signal: AbortSignal) {
    injectPostDialogAtTwitter(signal)
    injectPostDialogHintAtTwitter(signal)
}
