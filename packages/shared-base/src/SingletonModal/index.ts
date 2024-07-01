import { delay } from '@masknet/kit'
import { Emitter } from '@servie/events'

export type SingletonModalRef<OpenProps = void, CloseProps = void> = (
    onOpen: (props: OpenProps) => void,
    onClose: (props: CloseProps) => void,
    onAbort: (error: Error) => void,
) => {
    peek: () => boolean
    open: (props: OpenProps) => void
    close: (props: CloseProps) => void
    abort?: (error: Error) => void
}

export interface SingletonModalProps<OpenProps = void, CloseProps = void> {
    ref: React.Ref<SingletonModalRef<OpenProps, CloseProps>>
}

export class SingletonModal<
    OpenProps = void,
    CloseProps = void,
    T extends SingletonModalRef<OpenProps, CloseProps> = SingletonModalRef<OpenProps, CloseProps>,
> {
    constructor() {
        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
        this.abort = this.abort.bind(this)
        this.openAndWaitForClose = this.openAndWaitForClose.bind(this)
    }
    readonly emitter = new Emitter<{
        open: [OpenProps]
        close: [CloseProps]
        abort: [Error]
    }>()

    protected onOpen: ReturnType<T>['open'] | undefined
    protected onClose: ReturnType<T>['close'] | undefined
    protected onAbort: ReturnType<T>['abort'] | undefined

    private dispatchPeek: ReturnType<T>['peek'] | undefined
    private dispatchOpen: ReturnType<T>['open'] | undefined
    private dispatchClose: ReturnType<T>['close'] | undefined
    private dispatchAbort: ReturnType<T>['abort'] | undefined

    /**
     * Register a React modal component that implemented a forwarded ref.
     * The ref item should be fed with open and close methods.
     */
    register = (creator: T | null) => {
        if (!creator) {
            this.dispatchOpen = undefined
            this.dispatchClose = undefined
            this.dispatchAbort = undefined
            return
        }

        const ref = creator(
            (props) => {
                this.onOpen?.(props)
                this.emitter.emit('open', props)
            },
            (props) => {
                this.onClose?.(props)
                this.emitter.emit('close', props)
            },
            (error) => {
                this.onAbort?.(error)
                this.emitter.emit('abort', error)
            },
        )
        this.dispatchPeek = ref.peek
        this.dispatchOpen = ref.open
        this.dispatchClose = ref.close
        this.dispatchAbort = ref.abort
    }

    /**
     * Peek the open state of the React modal component.
     */
    peek() {
        return this.dispatchPeek?.() ?? false
    }

    /**
     * Open the registered modal component with props
     * @param props
     */
    open(props: OpenProps) {
        if (typeof this.dispatchOpen === 'undefined') console.warn("[SingletonModal]: The modal hasn't registered yet.")
        this.dispatchOpen?.(props)
    }

    /**
     * Close the registered modal component with props
     * @param props
     */
    close(props: CloseProps) {
        this.dispatchClose?.(props)
    }

    /**
     * Abort the registered modal component with Error
     */
    abort(error: Error) {
        this.dispatchAbort?.(error)
    }

    /**
     * Open the registered modal component and wait for it closes
     * @param props
     */
    openAndWaitForClose(props: OpenProps): Promise<CloseProps> {
        return new Promise<CloseProps>((resolve, reject) => {
            this.open(props)
            this.onClose = (props) => resolve(props)
            this.onAbort = (error) => reject(error)
        })
    }

    __unsafe_overwrite_methods__(methods: {
        open?: (props: OpenProps) => void
        close?: (props: CloseProps) => void
        abort?: (error: Error) => void
    }) {
        this.open = typeof methods.open === 'function' ? methods.open : this.open
        this.close = typeof methods.close === 'function' ? methods.close : this.close
        this.abort = typeof methods.abort === 'function' ? methods.abort : this.abort
    }
}

export class SingletonModalQueued<OpenProps = void, CloseProps = void> extends SingletonModal<OpenProps, CloseProps> {
    private opened = false
    private tasks: Array<{
        props: OpenProps
        defer?: PromiseWithResolvers<CloseProps>
    }> = []

    constructor() {
        super()

        this.emitter.on('open', () => {
            this.opened = true
        })
        this.emitter.on('close', () => {
            this.opened = false
            this.cleanup()
        })
        this.emitter.on('abort', () => {
            this.opened = false
            this.cleanup()
        })
    }

    override open(props: OpenProps) {
        if (!this.opened) {
            super.open(props)
            return
        }

        this.tasks.push({
            props,
        })
    }

    override close(props: CloseProps) {
        if (!this.opened) return

        super.close(props)
    }

    override openAndWaitForClose(props: OpenProps) {
        if (!this.opened) return super.openAndWaitForClose(props)

        const d = Promise.withResolvers<CloseProps>()
        this.tasks.push({
            props,
            defer: d,
        })
        return d.promise
    }

    private async cleanup() {
        if (this.opened || !this.tasks.length) return

        await delay(300)

        const { props, defer } = this.tasks.shift()!

        this.open(props)
        if (!defer) return
        this.onClose = (props) => defer.resolve(props)
        this.onAbort = (error) => defer.reject(error)
    }
}
