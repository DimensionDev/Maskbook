import { EMPTY_LIST, EMPTY_OBJECT } from '../constants.js'
import { createConstantSubscription } from '../helpers/subscription.js'

export const ZERO = createConstantSubscription(0)
export const UNDEFINED = createConstantSubscription(undefined)
export const EMPTY_STRING = createConstantSubscription('')
export const EMPTY_ARRAY = createConstantSubscription(EMPTY_LIST)
export const EMPTY_ENTRY = createConstantSubscription(EMPTY_OBJECT)
export const TRUE = createConstantSubscription(true)
export const FALSE = createConstantSubscription(false)
export const NULL = createConstantSubscription(null)
