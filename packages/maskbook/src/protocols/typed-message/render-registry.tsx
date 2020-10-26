import type { TypedMessage } from './'
import type { TypedMessageRendererProps } from '../../components/InjectedComponents/TypedMessageRenderer'
type Renderer<T extends TypedMessage> = React.ComponentType<TypedMessageRendererProps<T>>

interface RendererConfig<T extends TypedMessage> {
    component: Renderer<T>
    priority: number
    id: string
}
const registry = new Map<string, Set<RendererConfig<any>>>()
// TODO: before metadata, after metadata, ...
export function registerTypedMessageRenderer<T extends TypedMessage>(matching: T['type'], config: RendererConfig<T>) {
    const set = registry.get(matching) || new Set()
    // No overwrite in production
    if (process.env.NODE_ENV === 'development') {
        for (const item of set)
            if (item.id === config.id) {
                set.delete(item)
                break
            }
    }
    set.add(config)
    registry.set(matching, set)
}
// TODO: add settings for "selected" renderer
export function getRendererOfTypedMessage<T extends TypedMessage>(message: T): RendererConfig<T>[] {
    const list = [...(registry.get(message.type) || []), ...(registry.get('*') || [])].sort(
        (x, y) => x.priority - y.priority,
    )
    return list as any
}
