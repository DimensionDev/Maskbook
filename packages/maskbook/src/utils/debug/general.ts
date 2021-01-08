import BigNumber from 'bignumber.js'
import * as shared from '@dimensiondev/maskbook-shared'
import * as kit from '@dimensiondev/holoflows-kit'

// Run this file multiple times should be safe
if (module.hot) module.hot.accept()

//#region BigNumber to Number
Object.defineProperty(BigNumber.prototype, '__debug__amount__', {
    get(this: BigNumber) {
        return this.toNumber()
    },
    configurable: true,
})
//#endregion

//#region Useful global variables
Object.assign(globalThis, shared)
Object.assign(globalThis, kit)
Object.assign(globalThis, { BigNumber })
//#endregion
