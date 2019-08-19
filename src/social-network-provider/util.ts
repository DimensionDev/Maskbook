export const sharedInjectedScriptCode = `
    {
        const script = document.createElement('script')
        script.src = "${browser.runtime.getURL('js/injectedscript.js')}"
        document.documentElement.appendChild(script)
    }
`
