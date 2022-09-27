import { createConstantSubscription } from '../utils/subscription.js'

export const ZERO = createConstantSubscription(0)
export const UNDEFINED = createConstantSubscription(undefined)
export const EMPTY_STRING = createConstantSubscription('')
export const EMPTY_ARRAY = createConstantSubscription([])
export const EMPTY_ENTITY = createConstantSubscription({})
export const TRUE = createConstantSubscription(true)
export const FALSE = createConstantSubscription(false)
export const NULL = createConstantSubscription(null)
