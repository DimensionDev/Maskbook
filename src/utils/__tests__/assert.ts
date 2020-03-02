import { notNullable } from '../assert'
import { AssertionError } from 'assert'

const assertErrorMessage = '__assert_error_message__'
const assertError = new AssertionError({
    message: assertErrorMessage,
})

test('not nullable', () => {
    expect(() => notNullable(0, assertErrorMessage)).not.toThrow()
    expect(() => notNullable(null, assertErrorMessage)).toThrow(assertError)
    expect(() => notNullable(undefined, assertErrorMessage)).toThrow(assertError)
})
