/// <reference types="ses" />
lockdown({
    // In production, we have CSP enforced no eval
    // In development, we use Trusted Types.
    evalTaming: 'unsafeEval',
    //
    overrideTaming: 'severe',
    consoleTaming: 'unsafe',
    errorTaming: 'unsafe',
})

// https://github.com/endojs/endo/issues/1345 and https://github.com/endojs/endo/issues/1346
console.clear()

// completion value
null
