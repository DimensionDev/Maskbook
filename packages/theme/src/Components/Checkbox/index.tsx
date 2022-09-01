import type { FC } from 'react'
import { Icons } from '@masknet/icons'
import type { RadioProps } from '../Radio'

export interface CheckboxProps extends RadioProps {}

export const Checkbox: FC<CheckboxProps> = ({ checked, ...rest }) => {
    const Icon = checked ? Icons.CheckboxChecked : Icons.CheckboxUnchecked
    return <Icon role="button" {...rest} />
}
