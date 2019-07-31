import { defineSocialNetworkWorker } from '../../social-network/worker'
import { sharedProvider } from './shared-provider'

defineSocialNetworkWorker({
    ...sharedProvider,
    injectedScript: {
        code: `
            {
                const script = document.createElement('script')
                script.src = "${browser.runtime.getURL('js/injectedscript.js')}"
                document.documentElement.appendChild(script)
            }
        `,
        url: [{ hostEquals: 'www.facebook.com' }, { hostEquals: 'm.facebook.com' }],
    },
})
