import { createContext } from 'react'
import type { RenderConfig } from '../registry.js'

export const RegistryContext = createContext<(type: string) => void | undefined | RenderConfig<any>>(() => {
    console.error(
        '[@masknet/typed-message] Please create a TypedMessageRenderRegistry and provide it via RegistryContext',
    )
})
RegistryContext.displayName = 'RegistryContext'
