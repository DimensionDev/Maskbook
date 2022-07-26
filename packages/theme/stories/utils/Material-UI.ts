import type { ButtonProps, SelectProps, TextFieldProps } from '@mui/material'
import type { ArgType, ArgTypes } from '@storybook/addons'
import { argsOfArr, ControlType } from './args'
function enumIn<T>(enums: {
    [Prop in keyof T]?: (
        argsFromEnum: (enumString: Array<NonNullable<T[Prop]>>, type?: ControlType) => ArgType,
    ) => ArgType
}): ArgTypes {
    for (const key of Object.keys(enums) as Array<keyof T>) {
        enums[key] = (enums[key] as any)(argsOfArr)
    }
    return enums as ArgTypes
}

export const MuiArgs = {
    button: {
        disabled: { type: 'boolean' },
        ...enumIn<ButtonProps>({
            // @ts-ignore
            color: (e) => e(['primary', 'success', 'warning', 'error', 'info']),
            // @ts-ignore
            variant: (e) =>
                e([
                    'contained',
                    'outlined',
                    'text',
                    'roundedContained',
                    'roundedOutlined',
                    'roundedText',
                    'roundedDark',
                ]),
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
