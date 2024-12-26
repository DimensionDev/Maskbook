import { memo } from 'react'
import { Icons, type GeneratedIconProps } from '@masknet/icons'

interface Props extends GeneratedIconProps {
    checked?: boolean
    uncheckedColor?: string
    checkedColor?: string
}

export const RadioIndicator = memo<Props>(function RadioIndicator({ checked, uncheckedColor, checkedColor, ...rest }) {
    return checked ?
            <Icons.RadioButtonChecked {...rest} color={checkedColor || rest.color} />
        :   <Icons.RadioButtonUnChecked {...rest} color={uncheckedColor || rest.color} />
})
