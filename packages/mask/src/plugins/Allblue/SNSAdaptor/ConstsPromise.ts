import type { AllblueConsts } from '../types'

enum Status {
    PENDING,
    FULFILLED,
    REJECTED,
}
export default class AllblueConstsPromise {
    constructor() {}

    init = (executor: (resolve: (value: AllblueConsts) => void, reject: (reason: any) => void) => void) => {
        if (!this.initialized) {
            this.initialized = true
            executor(this.resolve, this.reject)
        }
    }

    initialized: boolean = false
    status: Status = Status.PENDING

    value?: AllblueConsts
    err?: any

    successCallback: ((value?: AllblueConsts) => void)[] = []
    failCallback: ((err: any) => void)[] = []

    resolve = (value: AllblueConsts) => {
        if (this.status !== Status.PENDING) return
        this.status = Status.FULFILLED
        this.value = value
        while (this.successCallback.length) {
            const cb = this.successCallback.shift()
            cb && cb(this.value)
        }
    }
    reject = (reason: any) => {
        if (this.status !== Status.PENDING) return
        this.status = Status.REJECTED
        this.err = reason
        while (this.failCallback.length) {
            const cb = this.failCallback.shift()
            cb && cb(this.err)
        }
    }

    then(successCallback: (value?: AllblueConsts) => void, failCallback?: (err: any) => void) {
        if (this.status === Status.FULFILLED) {
            successCallback(this.value)
        } else if (this.status === Status.REJECTED) {
            failCallback && failCallback(this.err)
        } else {
            this.successCallback.push(successCallback)
            failCallback && this.failCallback.push(failCallback)
        }
    }
}
