import type { ButtonProps, SelectProps, TextFieldProps } from '@material-ui/core'
import type { ArgType, ArgTypes } from '@storybook/addons'
import { argsOfArr, ControlType } from './args'
function enumIn<T>(enums: {
    [Prop in keyof T]?: (argsFromEnum: (enumString: NonNullable<T[Prop]>[], type?: ControlType) => ArgType) => ArgType
}): ArgTypes {
    for (const key in enums) enums[key] = (enums[key] as any)(argsOfArr)
    return enums as ArgTypes
}
export const MuiArgs = {
    button: {
        disabled: { type: 'boolean' },
        ...enumIn<ButtonProps>({
            size: (e) => e(['small', 'medium', 'large']),
        }),
    },
    textField: {
        disabled: { type: 'boolean' },
        ...enumIn<TextFieldProps>({
            size: (e) => e(['small', 'medium']),
        }),
    },
    select: enumIn<SelectProps>({
        size: (e) => e(['medium', 'small']),
        variant: (e) => e(['filled', 'outlined', 'standard']),
    }),
}
