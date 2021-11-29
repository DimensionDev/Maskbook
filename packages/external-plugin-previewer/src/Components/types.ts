export interface Component<P> {
    (props: P, dispatchEvent: (event: Event) => void): React.ReactChild
    displayName: string
}
