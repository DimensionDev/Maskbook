import { injectPostDialogAtTwitter } from './PostDialog.js'
import { injectPostDialogHintAtTwitter } from './PostDialogHint.js'

export function injectPostBoxComposed(signal: AbortSignal) {
    injectPostDialogAtTwitter(signal)
    injectPostDialogHintAtTwitter(signal)
}
