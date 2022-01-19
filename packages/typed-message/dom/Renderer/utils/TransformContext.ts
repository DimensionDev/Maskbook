import type { Transformer, TypedMessage } from '../../../base'
import { createContext, useContext, useMemo } from 'react'
import { emptyTransformationContext, TransformationContext } from '../../../base/transformer/context'
export const TransformerContext = createContext<readonly [Transformer, TransformationContext]>([
    (x) => x,
    emptyTransformationContext,
])

export function useTransformedValue(message: TypedMessage): TypedMessage
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined {
    const [transform, context] = useContext(TransformerContext)
    return useMemo(() => {
        return message ? transform(message, context) : undefined
    }, [message, transform, context])
}
