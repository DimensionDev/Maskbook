import type { Subscription } from 'use-subscription'
import type { TypedMessage } from '../../../base'
import type { Transformer } from './TransformContext'
export interface ComposedTransformers {
    subscription: Subscription<Transformer>
    addTransformer(transformer: Transformer, priority: number, signal?: AbortSignal): () => void
}
export function composeTransformer(): ComposedTransformers {
    const event = new EventTarget()
    const transformers = new Set<readonly [Transformer, number]>()

    function composed(message: TypedMessage) {
        return [...transformers].sort((a, b) => a[1] - b[1]).reduce((p, [c]) => c(p), message)
    }

    const subscription: Subscription<Transformer> = {
        getCurrentValue: () => (message) => composed(message),
        subscribe(f) {
            event.addEventListener('update', f)
            return () => {
                event.removeEventListener('update', f)
            }
        },
    }
    return {
        subscription,
        addTransformer(t, priority, signal) {
            const set = [t, priority] as const
            transformers.add(set)
            event.dispatchEvent(new Event('update'))
            const remove = () => {
                transformers.delete(set)
                event.dispatchEvent(new Event('update'))
            }
            signal?.addEventListener('abort', remove)
            return remove
        },
    }
}
