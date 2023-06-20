/// <reference path="../../polyfills/types/dom.d.ts" />
if (typeof trustedTypes === 'object' && location.protocol.includes('extension')) {
    // https://github.com/TanStack/query/issues/5417
    const ReactQueryStyle = `
            .ReactQueryDevtoolsPanel * {
              scrollbar-color: #132337 #3f4e60;
            }

            .ReactQueryDevtoolsPanel *::-webkit-scrollbar, .ReactQueryDevtoolsPanel scrollbar {
              width: 1em;
              height: 1em;
            }

            .ReactQueryDevtoolsPanel *::-webkit-scrollbar-track, .ReactQueryDevtoolsPanel scrollbar-track {
              background: #132337;
            }

            .ReactQueryDevtoolsPanel *::-webkit-scrollbar-thumb, .ReactQueryDevtoolsPanel scrollbar-thumb {
              background: #3f4e60;
              border-radius: .5em;
              border: 3px solid #132337;
            }
          `
    trustedTypes.createPolicy('default', {
        // do not add createHTML or createScript.
        // createScriptURL is safe because according to the CSP we have, it is impossible to
        // include/create a script from cross-origin.
        createScriptURL: (string) => string,

        createHTML: (html) => {
            if (html !== ReactQueryStyle) {
                throw new TypeError('Failed to convent a String to a TrustedHTML')
            }
            return html
        },
    })

    if (location.pathname !== '/popups.html') {
        trustedTypes.createPolicy('ssr', {})
    }
}

undefined
