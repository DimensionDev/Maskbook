import { memo } from 'react'
import { Icons, type GeneratedIconProps } from '@masknet/icons'

interface Props extends GeneratedIconProps {
    checked?: boolean
    unCheckedButtonColor?: string
    checkedButtonColor?: string
}

export const CheckBoxIndicator = memo<Props>(function CheckBoxIndicator({
    checked,
    unCheckedButtonColor,
    checkedButtonColor,
    ...rest
}) {
    return checked ? (
        <Icons.Checkbox {...rest} color={checkedButtonColor} />
    ) : (
        <Icons.CheckboxBlank {...rest} color={unCheckedButtonColor} />
    )
})
