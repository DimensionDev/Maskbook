import { createTypedMessageRenderRegistry } from '@masknet/typed-message/dom'
import { MaskPayloadRender } from './MaskPayload'
export const TypedMessageRenderRegistry = createTypedMessageRenderRegistry()
TypedMessageRenderRegistry.registerTypedMessageRender('x-mask-payload', {
    component: MaskPayloadRender,
    id: Symbol('io-mask.x-mask-payload'),
    priority: 1000,
})
