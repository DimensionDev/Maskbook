import { ButtonProps } from '@material-ui/core'
import { ArgType, ArgTypes } from '@storybook/addons'
import { argsOfEnum } from './args'

enum ButtonVariant {
    outlined,
    text,
    contained,
}
function args<P>(obj: Partial<Record<keyof P, ArgType>>): ArgTypes {
    return obj as ArgTypes
}
export const MuiArgs = {
    button: args<ButtonProps>({ variant: argsOfEnum(ButtonVariant) }),
}
