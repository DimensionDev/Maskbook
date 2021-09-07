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
export function matrix<T>(
    args: {
        [Prop in keyof T]?: Array<NonNullable<T[Prop]> | undefined>
    },
) {
    return {
        matrix: {
            pattern: args,
            // backgroundColor: 'rgba(0,0,0,0.7)', // Optional: If you want to change background color
            // showOriginal: true // Optional: If you want to show original component set to true
        },
    }
}
