import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { CompositionRequest } from './Mask'

/**
 * @deprecated
 * Prefer MaskMessages.
 *
 * Only use this in the following cases:
 *
 * - You need to send message across different plugins
 *       e.g. from the packages/plugins/Example to packages/plugins/Example2
 * - You need to send message from plugin
 *       e.g. packages/plugins/Example to the main Mask extension.
 */
// TODO: find a way to use a good API for cross isolation communication.
export const CrossIsolationMessages = new WebExtensionMessage<CrossIsolationEvents>({ domain: '_' })

export interface CrossIsolationEvents {
    requestComposition: CompositionRequest
}
