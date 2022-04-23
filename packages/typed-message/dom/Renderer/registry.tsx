import type {
    TypedMessage,
    TypedMessageText,
    TypedMessageImage,
    TypedMessageUnknown,
    TypedMessageAnchor,
    TypedMessageTuple,
    TypedMessagePromise,
} from '../../base/index.js'
import { TypedMessageTextRenderer } from './Core/Text.js'
import { TypedMessageImageRenderer } from './Core/Image.js'
import { TypedMessageTupleRenderer } from './Core/Tuple.js'
import { TypedMessagePromiseRenderer } from './Core/Promise.js'
import { TypedMessageUnknownRenderer } from './Core/Unknown.js'
import { TypedMessageAnchorRenderer } from './Extension/Anchor.js'

export interface RenderConfig<T extends TypedMessage = TypedMessage> {
    component: React.ComponentType<T>
    priority: number
    id: symbol
}

export function createTypedMessageRenderRegistry() {
    const registry = new Map<string, Map<symbol, RenderConfig<any>>>()
    const event = new EventTarget()

    function registerTypedMessageRender<T extends TypedMessage>(type: T['type'], config: RenderConfig<T>) {
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
    function getTypedMessageRender<T extends TypedMessage>(type: T['type']): RenderConfig<T> | undefined {
        return Array.from(registry.get(type)?.values() || []).sort((a, b) => b.priority - a.priority)[0]
    }
    const subscription = {
        // generate a new function everytime to make sure old !== new
        getCurrentValue: (): typeof getTypedMessageRender => (type) => getTypedMessageRender(type),
        subscribe: (f: () => void) => {
            event.addEventListener('update', f)
            return () => event.removeEventListener('update', f)
        },
    }

    registerTypedMessageRender<TypedMessageText>('text', {
        component: TypedMessageTextRenderer,
        id: Symbol('std.text'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessageImage>('image', {
        component: TypedMessageImageRenderer,
        id: Symbol('std.image'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessageUnknown>('unknown', {
        component: TypedMessageUnknownRenderer,
        id: Symbol('std.unknown'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessageTuple>('tuple', {
        component: TypedMessageTupleRenderer,
        id: Symbol('std.tuple'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessagePromise>('promise', {
        component: TypedMessagePromiseRenderer,
        id: Symbol('std.promise'),
        priority: 0,
    })

    // Extension
    registerTypedMessageRender<TypedMessageAnchor>('x-anchor', {
        component: TypedMessageAnchorRenderer,
        id: Symbol('std.anchor'),
        priority: 0,
    })

    return {
        registerTypedMessageRender,
        getTypedMessageRender,
        subscription,
    }
}
