export interface Middleware<Context> {
    fn: (context: Context, next: () => Promise<void>) => Promise<void>
}

export interface Translator<Context> {
    encode?(context: Context): Promise<void>
    decode?(context: Context): Promise<void>
}

export class Composer<T> {
    private items: Array<Middleware<T>> = []

    private compose() {
        return (context: T, next: () => Promise<void>) => {
            let index = -1
            const dispatch = (i: number): Promise<void> => {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'))
                index = i
                let fn
                if (i >= this.items.length) fn = next
                else fn = this.items[i].fn.bind(this.items[i])
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

    /**
     * Use a middleware
     * @param middleware
     */
    public use(middleware: Middleware<T>) {
        this.items.push(middleware)
    }

    /**
     * Run all registered middleware
     * @param context
     * @param next
     */
    public async dispatch(context: T, next: () => Promise<void>) {
        await this.compose()(context, next)
    }

    static from<T>(...items: Array<Middleware<T>>) {
        const composer = new Composer<T>()
        items.forEach((x) => composer.use(x))
        return composer
    }
}
