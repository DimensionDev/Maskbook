import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {
        console.debug('Example plugin has been loaded.')
        signal.addEventListener('abort', () => console.debug('Example plugin has been terminated'))
    },
    // PostInspector: HelloWorld,
    // SearchBoxComponent: HelloWorld,
    // DecryptedInspector: HelloWorld,
    // GlobalInjection: GlobalComponent,
}
function HelloWorld(props: any) {
    console.log(props)
    return <h1 style={{ background: 'white', color: 'black' }}>Hello, World</h1>
}
export default sns
