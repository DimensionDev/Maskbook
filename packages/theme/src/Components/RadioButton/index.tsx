import { memo } from 'react'
import { Icons, type GeneratedIconProps } from '@masknet/icons'

interface Props extends GeneratedIconProps {
    checked?: boolean
}

export const RadioButton = memo<Props>(function RadioButton({ checked, ...rest }) {
    return checked ? <Icons.RadioButtonChecked {...rest} /> : <Icons.RadioButtonUnChecked {...rest} />
})
