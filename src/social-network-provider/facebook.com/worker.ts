import { defineSocialNetworkWorker } from '../../social-network/worker'

defineSocialNetworkWorker('facebook.com', e => ({
    injectedScript: {
        code: `{
            const script = document.createElement('script')
            script.src = "${browser.runtime.getURL('js/injectedscript.js')}"
            document.documentElement.appendChild(script)
        }`,
        url: [{ hostEquals: 'www.facebook.com' }, { hostEquals: 'm.facebook.com' }],
    },
}))
