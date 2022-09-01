import { GeneratedIconProps, Icons } from '@masknet/icons'
import type { FC } from 'react'

export interface RadioProps extends GeneratedIconProps {
    checked?: boolean
}

export const Radio: FC<RadioProps> = ({ checked, ...rest }) => {
    const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnChecked
    return <Icon role="button" {...rest} />
}
