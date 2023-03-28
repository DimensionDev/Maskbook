export class Flags<T extends object> {
    constructor(protected defaults: T) {}

    get accessor(): Readonly<T> {
        return new Proxy(this.defaults, {
            get(target, key, receiver) {
                return Reflect.get(target, key, receiver)
            },
            set(target, key, value, receiver) {
                throw new Error('Not allowed')
            },
        })
    }
}
