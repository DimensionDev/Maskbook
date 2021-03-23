// import { injectToolboxDialogAtTwitter } from './ToolboxDialog'
import { injectToolboxHintAtTwitter } from './ToolboxHint'

export function injectToolBoxComposed(signal: AbortSignal) {
    injectToolboxHintAtTwitter(signal)
}
