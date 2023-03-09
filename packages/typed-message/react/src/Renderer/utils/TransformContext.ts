import {
    type Transformer,
    type TypedMessage,
    emptyTransformationContext,
    type TransformationContext,
} from '@masknet/typed-message'
import { createContext, useContext, useMemo } from 'react'
export const TransformerProvider = createContext<Transformer>((x) => x)
TransformerProvider.displayName = 'TransformerProvider'
export const TransformationContextProvider = createContext<TransformationContext>(emptyTransformationContext)
TransformationContextProvider.displayName = 'TransformationContextProvider'

export function useTransformedValue(message: TypedMessage): TypedMessage
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined
export function useTransformedValue(message: undefined | TypedMessage): TypedMessage | undefined {
    const transformer = useContext(TransformerProvider)
    const context = useContext(TransformationContextProvider)
    return useMemo(() => {
        return message ? transformer(message, context) : undefined
    }, [message, transformer, context])
}
