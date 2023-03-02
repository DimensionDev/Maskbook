/** @internal */
export function hasCircular(message: object) {
    try {
        JSON.stringify(message)
        return false
    } catch {
        console.warn(
            '[@masknet/typed-message] TypedMessage',
            message,
            'may contains circular structure. Skip rendering.',
        )
        return true
    }
}
