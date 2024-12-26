import { memo } from 'react'
import { Icons, type GeneratedIconProps } from '@masknet/icons'

interface Props extends GeneratedIconProps {
    checked?: boolean
    uncheckedColor?: string
    checkedColor?: string
}

export const CheckBoxIndicator = memo<Props>(function CheckBoxIndicator({
    checked,
    uncheckedColor,
    checkedColor,
    ...rest
}) {
    return checked ?
            <Icons.Checkbox {...rest} color={checkedColor || rest.color} />
        :   <Icons.CheckboxBlank {...rest} color={uncheckedColor || rest.color} />
})
