import BigNumber from 'bignumber.js'

// Run this file multiple times should be safe
if (import.meta.webpackHot) import.meta.webpackHot.accept()

// #region BigNumber to Number
Object.defineProperty(BigNumber.prototype, '__debug__amount__', {
    get(this: BigNumber) {
        return this.toNumber()
    },
    configurable: true,
})
// #endregion
