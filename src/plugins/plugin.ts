export interface PluginConfig {
    shouldActivate(post: string): boolean
    Renderer: React.ComponentType<{ post: string }>
}
