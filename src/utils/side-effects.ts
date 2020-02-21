/**
 * There are some side effects in a module import.
 * Those side effects sometimes cause an error in the test(jest) env.
 *
 * To chain the sideEffect after this Promise,
 * the sideEffect will only be invoked in the non-test env.
 */
let invokeSideEffect: () => void
export const sideEffect = new Promise<void>(resolve => (invokeSideEffect = resolve))
try {
    // TODO: also skip storybook env
    if (process.env.NODE_ENV === 'test') {
    } else {
        throw new Error()
    }
} catch {
    if (typeof invokeSideEffect! === 'undefined') {
        const i = setInterval(() => {
            if (typeof invokeSideEffect === 'undefined') return
            clearInterval(i)
            invokeSideEffect!()
        }, 10)
    } else {
        invokeSideEffect()
    }
}
