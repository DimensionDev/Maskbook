export interface Component<P> {
    (props: P, dispatchEvent: (event: Event) => void): React.ReactNode
    displayName: string
}
