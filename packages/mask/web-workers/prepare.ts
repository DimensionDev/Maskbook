if (typeof self !== 'undefined') {
    /**
     * Workaround: Webpack child compiler doesn't inherit plugins but inherit loaders.
     * That make loaders/plugins settings mismatch and cause runtime errors.
     */ // @ts-ignore
    self.$RefreshReg$ = function () {}
    // @ts-ignore
    self.$RefreshSig$ = function () {
        return function (type: any) {
            return type
        }
    }
}
export {}
setTimeout(() => self.postMessage('Alive'), 0)
