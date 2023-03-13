if (typeof trustedTypes === 'object' && location.protocol.includes('extension')) {
    trustedTypes.createPolicy('default', {
        // do not add createHTML or createScript.
        // createScriptURL is safe because according to the CSP we have, it is impossible to
        // include/create a script from cross-origin.
        createScriptURL: (string) => string,
    })

    if (location.pathname !== '/popups.html') {
        trustedTypes.createPolicy('ssr', {})
    }
}

undefined
