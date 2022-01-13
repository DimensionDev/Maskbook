import type { TypedMessage } from '../../../base'
import { createContext } from 'react'
export type Transformer = (message: TypedMessage) => TypedMessage
export const TransformerContext = createContext<Transformer>((x) => x)
