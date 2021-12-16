import type { ProviderConfig } from './types'
import { Provider } from './types'

export const FileServicePluginID = 'com.maskbook.fileservice'
export const META_KEY_1 = 'com.maskbook.fileservice:1'
export const META_KEY_2 = 'com.maskbook.fileservice:2'

export const MAX_FILE_SIZE = 0xa00000 // = 10 MiB

export const landing = 'https://files.r2d2.to/partner/arweave/landing-page.html'
export const signing = 'https://service.r2d2.to/arweave-remote-signing'
export const mesonPrefix = 'https://coldcdn.com/api/cdn/9m5pde'

export const enum FileRouter {
    upload = '/upload',
    uploading = '/uploading',
    uploaded = '/uploaded',
}

export const allProviders: ProviderConfig[] = [
    {
        provider: Provider.arweave,
        key: 'plugin_file_service_provider_arweave',
    },
    {
        provider: Provider.ipfs,
        key: 'plugin_file_service_provider_ipfs',
    },
    {
        provider: Provider.swarm,
        key: 'plugin_file_service_provider_swarm',
    },
]
