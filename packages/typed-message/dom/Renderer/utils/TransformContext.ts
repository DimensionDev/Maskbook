import { Transformer, TypedMessage, emptyTransformationContext, TransformationContext } from '../../../base/index.js'
import { createContext, useContext, useMemo } from 'react'
export const TransformerProvider = createContext<Transformer>((x) => x)
export const TransformationContextProvider = createContext<TransformationContext>(emptyTransformationContext)

export function useTransformedValue(message: TypedMessage): TypedMessage
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined {
    const transformer = useContext(TransformerProvider)
    const context = useContext(TransformationContextProvider)
    return useMemo(() => {
        return message ? transformer(message, context) : undefined
    }, [message, transformer, context])
}
