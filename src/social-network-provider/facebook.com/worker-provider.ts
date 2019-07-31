import { defineSocialNetworkWorker } from '../../social-network/worker'

defineSocialNetworkWorker({
    name: 'Facebook',
    networkURL: 'https://www.facebook.com/',
    init(env, pref) {},
    injectedScript: {
        code: `{
        const script = document.createElement('script')
        script.src = "${browser.runtime.getURL('js/injectedscript.js')}"
        document.documentElement.appendChild(script)
    }`,
        url: [{ hostEquals: 'www.facebook.com' }, { hostEquals: 'm.facebook.com' }],
    },
})
