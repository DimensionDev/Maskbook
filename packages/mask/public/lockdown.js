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
// completion value
null
