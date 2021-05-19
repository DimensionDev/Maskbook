export { MaskCard } from './MaskCard'
export { Translate } from './Translate'

export const Span: Component<{}> = () => (
    <span>
        <slot />
    </span>
)
Span.displayName = 'span'
export interface Component<P> {
    (props: P, dispatchEvent: (event: Event) => void): React.ReactChild
    displayName: string
}
