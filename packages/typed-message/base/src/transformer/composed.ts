import type { TypedMessage } from '../base.js'
import type { TransformationContext } from './context.js'
import type { Transformer } from './index.js'
export interface ComposedTransformers {
    subscription: {
        getCurrentValue: () => Transformer
        subscribe(f: () => void): () => void
    }
    addTransformer(
        transformer: Transformer | ComposedTransformers['subscription'],
        priority: number,
        signal?: AbortSignal,
    ): () => void
}
export function composeTransformers(): ComposedTransformers {
    const event = new EventTarget()
    const onUpdate = () => {
        composedTransformer = undefined
        event.dispatchEvent(new Event('update'))
    }
    const transformers = new Set<readonly [Transformer, number]>()

    let composedTransformer: Transformer | undefined
    function composed(message: TypedMessage, context: TransformationContext) {
        return [...transformers].sort((a, b) => b[1] - a[1]).reduce((p, [c]) => c(p, context), message)
    }

    const subscription = {
        getCurrentValue: () =>
            (composedTransformer ??= (message, context) => {
                return composed(message, context)
            }),
        subscribe(f: () => void) {
            event.addEventListener('update', f)
            return () => {
                event.removeEventListener('update', f)
            }
        },
    }
    return {
        subscription,
        addTransformer(t, priority, signal) {
            const f_priority = [
                typeof t === 'function' ? t : (
                    (message: TypedMessage, context: TransformationContext) => t.getCurrentValue()(message, context)
                ),
                priority,
            ] as const
            transformers.add(f_priority)
            onUpdate()

            const cancelSubscription = typeof t === 'function' ? () => {} : t.subscribe(onUpdate)

            const remove = () => {
                transformers.delete(f_priority)
                cancelSubscription()
                onUpdate()
            }

            signal?.addEventListener('abort', remove)
            return remove
        },
    }
}
