/// <reference types="ses" />
if (
    Object.isExtensible(Array.prototype) &&
    // https://github.com/facebook/react/issues/27005
    (typeof location === 'object'
        ? location.protocol.endsWith('extension:') && location.pathname !== '/devtools-background.html'
        : true)
) {
    try {
        // lockdown might fail when there is new well known Symbol
        lockdown({
            // In production, we have CSP enforced no eval
            // In development, we use Trusted Types.
            evalTaming: 'unsafeEval',
            //
            overrideTaming: 'severe',
            consoleTaming: 'unsafe',
            errorTaming: 'unsafe',
            errorTrapping: 'none',
            unhandledRejectionTrapping: 'none',
        })
    } catch {
    } finally {
        // https://github.com/endojs/endo/issues/1345 and https://github.com/endojs/endo/issues/1346
        console.clear()
    }
}

undefined
