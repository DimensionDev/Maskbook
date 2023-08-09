import { memo } from 'react'
import { Icons, type GeneratedIconProps } from '@masknet/icons'

interface Props extends GeneratedIconProps {
    checked?: boolean
    unCheckedButtonColor?: string
    checkedButtonColor?: string
}

export const RadioButton = memo<Props>(function RadioButton({
    checked,
    unCheckedButtonColor,
    checkedButtonColor,
    ...rest
}) {
    return checked ? (
        <Icons.RadioButtonChecked {...rest} color={checkedButtonColor} />
    ) : (
        <Icons.RadioButtonUnChecked {...rest} color={unCheckedButtonColor} />
    )
})
