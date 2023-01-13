export interface Middleware<Context> {
    fn: (context: Context, next: () => Promise<void>) => Promise<void>
}

export interface Translator<Context> {
    encode?(context: Context): Promise<void>
    decode?(context: Context): Promise<void>
}

export class Composer<T> {
    private listOfMiddleware: Array<Middleware<T>> = []

    private compose() {
        return (context: T, next: () => Promise<void>) => {
            let index = -1
            const dispatch = (i: number): Promise<void> => {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'))
                index = i
                let fn
                if (i >= this.listOfMiddleware.length) fn = next
                else fn = this.listOfMiddleware[i].fn.bind(this.listOfMiddleware[i])
                if (!fn) return Promise.resolve()
                try {
                    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
                } catch (err) {
                    return Promise.reject(err)
                }
            }

            return dispatch(0)
        }
    }

    public use(middleware: Middleware<T>) {
        this.listOfMiddleware.push(middleware)
    }

    public async dispatch(context: T, next: () => Promise<void>) {
        await this.compose()(context, next)
    }
}
