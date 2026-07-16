import {
    type Transformer,
    type TypedMessage,
    emptyTransformationContext,
    type TransformationContext,
} from '@masknet/typed-message'
import { createContext, useContext, useMemo } from 'react'
export const TransformerProviderContext = createContext<Transformer>((x) => x)
TransformerProviderContext.displayName = 'TransformerProvider'
export const TransformationContextProviderContext = createContext<TransformationContext>(emptyTransformationContext)
TransformationContextProviderContext.displayName = 'TransformationContextProviderContext'

export function useTransformedValue(message: TypedMessage): TypedMessage
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined {
    const transformer = useContext(TransformerProviderContext)
    const context = useContext(TransformationContextProviderContext)
    return useMemo(() => {
        return message ? transformer(message, context) : undefined
    }, [message, transformer, context])
}
