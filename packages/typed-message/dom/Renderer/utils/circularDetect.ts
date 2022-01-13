import type { TypedMessage } from '../../../base'

export function hasCircular(message: TypedMessage) {
    try {
        JSON.stringify(message)
        return false
    } catch (err) {
        console.warn(
            '[@masknet/typed-message] TypedMessage',
            message,
            'may contains circular structure. Skip rendering.',
        )
        return true
    }
}
