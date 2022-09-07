import { createConstantSubscription, EMPTY_LIST } from '@masknet/shared-base'

export const ZERO = createConstantSubscription(0)
export const UNDEFINED = createConstantSubscription(undefined)
export const EMPTY_STRING = createConstantSubscription('')
export const EMPTY_ARRAY = createConstantSubscription(EMPTY_LIST)
export const EMPTY_OBJECT = createConstantSubscription({})
export const TRUE = createConstantSubscription(true)
export const FALSE = createConstantSubscription(false)
export const NULL = createConstantSubscription(null)
