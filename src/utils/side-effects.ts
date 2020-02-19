/**
 * There are some side effects in a module import.
 * Those side effects sometimes cause an error in the test(jest) env.
 *
 * To chain the sideEffect after this Promise,
 * the sideEffect will only be invoked in the non-test env.
 */
export const sideEffect = new Promise<void>(resolve => (invokeSideEffect = resolve))
let invokeSideEffect: () => void = () => {
    throw new Error('Unreachable case')
}

try {
    // TODO: also skip storybook env
    if (process.env.NODE_ENV === 'test') {
    } else {
        throw new Error()
    }
} catch {
    invokeSideEffect()
}
