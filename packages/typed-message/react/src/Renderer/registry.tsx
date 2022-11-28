import type {
    TypedMessage,
    TypedMessageText,
    TypedMessageImage,
    TypedMessageUnknown,
    TypedMessageAnchor,
    TypedMessageTuple,
    TypedMessagePromise,
} from '@masknet/typed-message'
import { TypedMessageTextRender } from './Core/Text.js'
import { TypedMessageImageRender } from './Core/Image.js'
import { TypedMessageTupleRender } from './Core/Tuple.js'
import { TypedMessagePromiseRender } from './Core/Promise.js'
import { TypedMessageUnknownRender } from './Core/Unknown.js'
import { TypedMessageAnchorRender } from './Extension/Anchor.js'

export interface RenderConfig<T extends TypedMessage = TypedMessage> {
    component: React.ComponentType<T>
    priority: number
    id: symbol
}

export function createTypedMessageRenderRegistry() {
    const registry = new Map<string, Map<symbol, RenderConfig<any>>>()
    const event = new EventTarget()
    let getterFunction: typeof getTypedMessageRender | undefined

    function registerTypedMessageRender<T extends TypedMessage>(type: T['type'], config: RenderConfig<T>) {
        if (!registry.has(type)) registry.set(type, new Map())
        const map = registry.get(type)!

        const id = config.id
        map.set(id, config)
        getterFunction = undefined
        event.dispatchEvent(new Event('update'))
        return () => {
            map.delete(id)
            getterFunction = undefined
            event.dispatchEvent(new Event('update'))
        }
    }
    function getTypedMessageRender<T extends TypedMessage>(type: T['type']): RenderConfig<T> | undefined {
        return Array.from(registry.get(type)?.values() || []).sort((a, b) => b.priority - a.priority)[0]
    }
    const subscription = {
        // generate a new function to make sure old !== new
        getCurrentValue: () => (getterFunction ??= (type) => getTypedMessageRender(type)),
        subscribe: (f: () => void) => {
            event.addEventListener('update', f)
            return () => event.removeEventListener('update', f)
        },
    }

    registerTypedMessageRender<TypedMessageText>('text', {
        component: TypedMessageTextRender,
        id: Symbol('std.text'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessageImage>('image', {
        component: TypedMessageImageRender,
        id: Symbol('std.image'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessageUnknown>('unknown', {
        component: TypedMessageUnknownRender,
        id: Symbol('std.unknown'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessageTuple>('tuple', {
        component: TypedMessageTupleRender,
        id: Symbol('std.tuple'),
        priority: 0,
    })

    registerTypedMessageRender<TypedMessagePromise>('promise', {
        component: TypedMessagePromiseRender,
        id: Symbol('std.promise'),
        priority: 0,
    })

    // Extension
    registerTypedMessageRender<TypedMessageAnchor>('x-anchor', {
        component: TypedMessageAnchorRender,
        id: Symbol('std.anchor'),
        priority: 0,
    })

    return {
        registerTypedMessageRender,
        getTypedMessageRender,
        subscription,
    }
}
