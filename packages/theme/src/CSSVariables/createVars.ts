/** @internal */
export function css_var<T extends Record<string, unknown>>(
    unique_name: string,
    keys: T,
): { [key in keyof T]: string & ((defaultValue?: string) => string) } {
    for (const k in keys) keys[k] = createVar(k) as any
    return keys as any
    function createVar(name: string) {
        const val = '--' + unique_name + '-' + name
        function use(defaultValue?: string): string {
            return `var(${val}${typeof defaultValue === 'undefined' ? '' : ', ' + defaultValue})`
        }
        use.toString = () => val
        return use
    }
}
