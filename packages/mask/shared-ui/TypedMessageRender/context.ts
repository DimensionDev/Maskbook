import { RenderRegistryContext } from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { useSubscription } from 'use-subscription'

export function TypedMessageRenderContext(props: React.PropsWithChildren<{}>) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    return RenderRegistryContext.Provider({ value: registry, children: props.children })
}
