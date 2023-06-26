import { defer, delay, type DeferTuple } from '@masknet/kit'
import { Emitter } from '@servie/events'

export type SingletonModalRefCreator<OpenProps = void, CloseProps = void> = (
    onOpen: (props: OpenProps) => void,
    onClose: (props: CloseProps) => void,
    onAbort: (error: Error) => void,
) => {
    peek: () => boolean
    open: (props: OpenProps) => void
    close: (props: CloseProps) => void
    abort?: (error: Error) => void
}

export interface SingletonModalProps {
    children: React.ReactNode
}

export class SingletonModal<
    OpenProps = void,
    CloseProps = void,
    T extends SingletonModalRefCreator<OpenProps, CloseProps> = SingletonModalRefCreator<OpenProps, CloseProps>,
> {
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
}

export class SingletonModalQueued<OpenProps = void, CloseProps = void> extends SingletonModal<OpenProps, CloseProps> {
    private opened = false
    private tasks: Array<{
        props: OpenProps
        defer?: DeferTuple<CloseProps, Error>
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

        const d = defer<CloseProps, Error>()
        this.tasks.push({
            props,
            defer: d,
        })
        return d[0]
    }

    private async cleanup() {
        if (this.opened || !this.tasks.length) return

        await delay(300)

        const { props, defer } = this.tasks.shift()!

        this.open(props)
        if (!defer) return
        this.onClose = (props) => defer[1](props)
        this.onAbort = (error) => defer[2](error)
    }
}
