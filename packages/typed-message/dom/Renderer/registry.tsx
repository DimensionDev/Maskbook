import type {
    TypedMessage,
    TypedMessageText,
    TypedMessageImage,
    TypedMessageUnknown,
    TypedMessageAnchor,
    TypedMessageTuple,
    TypedMessagePromise,
} from '../../base'
import { TypedMessageTextRenderer } from './Core/Text'
import { TypedMessageImageRenderer } from './Core/Image'
import { TypedMessageTupleRenderer } from './Core/Tuple'
import { TypedMessagePromiseRenderer } from './Core/Promise'
import { TypedMessageUnknownRenderer } from './Core/Unknown'
import { TypedMessageAnchorRenderer } from './Extension/Anchor'
import type { MessageRenderProps } from './Entry'
import type { Subscription } from 'use-subscription'

export interface RenderConfig<T extends TypedMessage = TypedMessage> {
    component: React.ComponentType<MessageRenderProps<T>>
    priority: number
    id: symbol
}

export function createTypedMessageRenderRegistry() {
    const registry = new Map<string, Map<symbol, RenderConfig<any>>>()
    const event = new EventTarget()

    function registerTypedMessageRenderer<T extends TypedMessage>(type: T['type'], config: RenderConfig<T>) {
        if (!registry.has(type)) registry.set(type, new Map())
        const map = registry.get(type)!

        const id = config.id
        map.set(id, config)
        event.dispatchEvent(new Event('update'))
        return () => {
            map.delete(id)
            event.dispatchEvent(new Event('update'))
        }
    }
    function getTypedMessageRenderer<T extends TypedMessage>(type: T['type']): RenderConfig<T> | undefined {
        return Array.from(registry.get(type)?.values() || []).sort((a, b) => b.priority - a.priority)[0]
    }
    const subscription: Subscription<typeof getTypedMessageRenderer> = {
        // generate a new function everytime to make sure old !== new
        getCurrentValue: () => (type) => getTypedMessageRenderer(type),
        subscribe: (f) => {
            event.addEventListener('update', f)
            return () => event.removeEventListener('update', f)
        },
    }

    registerTypedMessageRenderer<TypedMessageText>('text', {
        component: TypedMessageTextRenderer,
        id: Symbol('std.text'),
        priority: 0,
    })

    registerTypedMessageRenderer<TypedMessageImage>('image', {
        component: TypedMessageImageRenderer,
        id: Symbol('std.image'),
        priority: 0,
    })

    registerTypedMessageRenderer<TypedMessageUnknown>('unknown', {
        component: TypedMessageUnknownRenderer,
        id: Symbol('std.unknown'),
        priority: 0,
    })

    registerTypedMessageRenderer<TypedMessageTuple>('tuple', {
        component: TypedMessageTupleRenderer,
        id: Symbol('std.tuple'),
        priority: 0,
    })

    registerTypedMessageRenderer<TypedMessagePromise>('promise', {
        component: TypedMessagePromiseRenderer,
        id: Symbol('std.promise'),
        priority: 0,
    })

    // Extension
    registerTypedMessageRenderer<TypedMessageAnchor>('x-anchor', {
        component: TypedMessageAnchorRenderer,
        id: Symbol('std.anchor'),
        priority: 0,
    })

    return {
        registerTypedMessageRenderer,
        getTypedMessageRenderer,
        subscription,
    }
}
