import type { TypedMessage } from '../base'
export type Transformer = (message: TypedMessage) => TypedMessage
export * from './composed'
