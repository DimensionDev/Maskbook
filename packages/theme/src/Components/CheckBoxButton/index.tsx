import { memo } from 'react'
import { Icons, type GeneratedIconProps } from '@masknet/icons'

interface Props extends GeneratedIconProps {
    checked?: boolean
    unCheckedButtonColor?: string
    checkedButtonColor?: string
}

export const CheckBoxButton = memo<Props>(function CheckBoxButton({
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
