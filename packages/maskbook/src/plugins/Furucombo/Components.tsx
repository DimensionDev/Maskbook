import { Box } from '@material-ui/core'
export function HelloWorld(props: any) {
    return <h1 style={{ background: 'white', color: 'black' }}>Hello, World</h1>
}
export function GlobalComponent() {
    return <Box position="fixed" top={233} left={233} children="Example Plugin" bgcolor="white" color="black" />
}
export function PluginDialog(props: { open: boolean; onClose: () => void }) {
    if (!props.open) return null
    // TODO: the ShadowRoot related items are in the maskbook-shared package
    // TODO: but plugins should only rely on the plugin-infra package
    // TODO: so it's not possible to display a proper dialog in an isolated package
    return <h1 onClick={props.onClose}>Hi~</h1>
}
