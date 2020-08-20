import type { TypedMessage } from './'
import type { TypedMessageRendererProps } from '../../components/InjectedComponents/TypedMessageRenderer'
type Renderer<T extends TypedMessage> = React.ComponentType<TypedMessageRendererProps<T>>

interface RendererConfig<T extends TypedMessage> {
    component: Renderer<T>
    priority: number
    id: string
}
const registry = new Map<string, Set<RendererConfig<any>>>()
export function registerTypedMessageRenderer<T extends TypedMessage>(matching: T['type'], config: RendererConfig<T>) {
    const set = registry.get(matching) || new Set()
    set.add(config)
    registry.set(matching, set)
}
// TODO: add settings for "selected" renderer
export function getRendererOfTypedMessage<T extends TypedMessage>(
    message: T,
): React.ComponentType<TypedMessageRendererProps<T>>[] {
    const list = [...(registry.get(message.type) || []), ...(registry.get('*') || [])].sort(
        (x, y) => x.priority - y.priority,
    )
    return list as any
}
