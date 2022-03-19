import type { ProducerPushFunction, RPCMethodRegistrationValue } from '../types'

export function getProxyVersion() {
    try {
        return process.env.PROXY_VERSION ?? ''
    } catch {
        return ''
    }
}

const fetchProxyVersion = async (push: ProducerPushFunction<string>): Promise<void> => {
    await push([getProxyVersion()])
}

const producer: RPCMethodRegistrationValue<string, null> = {
    method: 'mask.fetchProxyVersion',
    producer: fetchProxyVersion,
    distinctBy: (item) => item,
}

export default producer
