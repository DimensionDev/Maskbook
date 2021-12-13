import type { FindTrumanConst } from '../types'

enum Status {
    PENDING = 0,
    FULFILLED = 1,
    REJECTED = 2,
}
export default class FindTrumanConstPromise {
    constructor() {}

    init = (executor: (resolve: (value: FindTrumanConst) => void, reject: (reason: any) => void) => void) => {
        if (!this.initialized) {
            this.initialized = true
            executor(this.resolve, this.reject)
        }
    }

    initialized: boolean = false
    status: Status = Status.PENDING

    value?: FindTrumanConst
    err?: any

    successCallback: ((value?: FindTrumanConst) => void)[] = []
    failCallback: ((err: any) => void)[] = []

    resolve = (value: FindTrumanConst) => {
        if (this.status !== Status.PENDING) return
        this.status = Status.FULFILLED
        this.value = value
        while (this.successCallback.length) {
            const cb = this.successCallback.shift()
            cb?.(this.value)
        }
    }
    reject = (reason: any) => {
        if (this.status !== Status.PENDING) return
        this.status = Status.REJECTED
        this.err = reason
        while (this.failCallback.length) {
            const cb = this.failCallback.shift()
            cb?.(this.err)
        }
    }

    then(successCallback: (value?: FindTrumanConst) => void, failCallback?: (err: any) => void) {
        if (this.status === Status.FULFILLED) {
            successCallback(this.value)
        } else if (this.status === Status.REJECTED) {
            failCallback?.(this.err)
        } else {
            this.successCallback.push(successCallback)
            failCallback && this.failCallback.push(failCallback)
        }
    }
}
