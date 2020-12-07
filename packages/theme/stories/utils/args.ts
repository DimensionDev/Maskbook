export type ControlType = 'radio' | 'inline-radio' | 'check' | 'inline-check' | 'select' | 'multi-select'
export function argsOfEnum(e: object, type?: ControlType) {
    const options = Object.keys(e).filter((x) => Number.isNaN(Number.parseInt(x)))
    if (type === undefined) {
        if (options.length <= 3) type = 'inline-radio'
        else type = 'select'
    }
    return {
        control: { type, options },
    }
}
