import { defer } from '@dimensiondev/kit'
import type { Plugin } from '../types'

export class SharedContext {
    private context_: Plugin.Shared.SharedContext = null!
    private promise: Promise<void> = null!
    private resolvePromise: () => void = null!

    constructor() {
        ([this.promise, this.resolvePromise] = defer<void>())
    }

    get context() {
        if (!this.context_) throw new Error('Please setup context at first.')
        return this.context_
    }

    set context(newContext: Plugin.Shared.SharedContext) {
        this.context_ = newContext
        this.resolvePromise()
    }

    get isReady() {
        return !!this.context_
    }

    get untilReady() {
        return this.promise
    }
}
