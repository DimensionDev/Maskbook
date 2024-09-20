function compose<T>(...args: [...composer: Array<((arg: T) => T) | null | false>, init: T]) {
    if (args.length === 0) throw new TypeError()
    const last = args.pop() as T

    return (args as Array<((arg: T) => T) | null>).filter(Boolean).reduceRight((prev, fn) => fn!(prev), last)
}

export function jsxCompose<JSX>(...jsx: JSX[]) {
    return <ReactNode>(cloneElement: (jsx: JSX, props: any, children: ReactNode) => ReactNode, element: ReactNode) =>
        compose(...jsx.map((jsx) => (children: ReactNode) => cloneElement(jsx, undefined, children)), element)
}
