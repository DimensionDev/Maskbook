import type { InitInformation } from '../shared'
import { contentScript } from './bridge'

let connected = false
let metadata: Mask.SocialNetwork['metadata'] = undefined
export class SocialNetwork extends EventTarget implements Mask.SocialNetwork {
    constructor(init: InitInformation) {
        super()
        connected = init.SNSContext.connected
        metadata = init.SNSContext.meta
    }
    async appendComposition(message: string, metadata?: ReadonlyMap<string, unknown>) {
        if (metadata) metadata = new Map(metadata)
        contentScript.sns_appendComposition(message, metadata)
    }
    get connected() {
        return !!connected
    }
    get metadata() {
        return metadata
    }
}
