import { isEmpty } from 'lodash-es'
import { notStrictEqual as notEqual, strictEqual as equal } from 'assert'

export class WithStateAssert {
    private count = 0

    /**
     * Call this method in methods that should be only run once.
     * If more than once then it could cause memory leak.
     */
    public shouldOnlyRunOnce(msg: string = 'Potential memory leak detected') {
        this.count += 1
        if (this.count > 1) {
            console.warn(msg)
        }
    }
}

export const notInclude = (val: any, things: any[], message: string) => {
    things.forEach((value => {
        notEqual(val, value, message)
    }))
}

/**
 * Ensure a value not null or undefined.
 */
export const notNullable = <T>(val: T, message: string = 'Unexpected nil value detected') => {
    notInclude(val, [null, undefined], message)
    return val as NonNullable<T>
}

export const notEmpty = (val: any, message: string = 'Unexpected empty collection detected') => {
    equal(isEmpty(val), false, message)
    return val
}

export {
    equal,
    notEqual
}
