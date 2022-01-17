import type { Transformer } from '../../../base'
import { createContext } from 'react'
import { createTransformationContext, TransformationContext } from '../../../base/transformer/context'
export const TransformerContext = createContext<readonly [Transformer, TransformationContext]>([
    (x) => x,
    createTransformationContext(),
])
