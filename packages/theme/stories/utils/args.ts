export type ControlType = 'radio' | 'inline-radio' | 'check' | 'inline-check' | 'select' | 'multi-select'
export function argsOfArr<T>(keys: NonNullable<T>[], type?: ControlType) {
    if (type === undefined) {
        if (keys.length <= 6) type = 'inline-radio'
        else type = 'select'
    }
    const options = {} as any
    keys.forEach((x) => (options[x] = x))
    return { control: { type, options } }
}
