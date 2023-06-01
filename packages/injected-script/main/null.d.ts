interface NullPrototype {
    __proto__: null
}
interface ProxyHandler<T extends object> extends NullPrototype {}
interface BlobPropertyBag extends NullPrototype {}
interface CustomEventInit<T = any> extends EventInit, NullPrototype {}
interface AddEventListenerOptions extends EventListenerOptions, NullPrototype {}
