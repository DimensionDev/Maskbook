declare module 'ef.js' {
    export interface DOMImpl {
        Node: typeof Node
        document: typeof document
    }
    export function setDOMImpl(impl: DOMImpl): void
    export function create(template: string | TemplateStringsArray): typeof Component

    // Not exported
    class Component<T extends object = Record<string, any>> {
        constructor(options?: ComponentConstructorOptions<T>)
        $mount(opt: MountOptions): void
        $destroy(): void
        $methods: Record<string, Function>
        $data: T
        $subscribe(key: keyof T, callback: Function): void
        $unsubscribe(key: keyof T, callback: Function): void
    }
    export interface ComponentConstructorOptions<T> {
        $data: T
    }
    export interface MountOptions {
        target: Node
    }
    export function t(template: TemplateStringsArray): typeof Component
}
