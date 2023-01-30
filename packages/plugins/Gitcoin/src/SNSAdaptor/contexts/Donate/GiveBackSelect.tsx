import { FC, memo } from 'react'
import { MenuItem, Select, SelectProps } from '@mui/material'

interface Props extends SelectProps<number> {}

const OPTIONS = [0, 0.05, 0.1, 0.15]
export const GiveBackSelect: FC<Props> = memo((props) => {
    return (
        <Select
            {...props}
            MenuProps={{
                disablePortal: true,
                disableScrollLock: true,
                ...props.MenuProps,
            }}>
            {OPTIONS.map((ratio) => (
                <MenuItem key={ratio} value={ratio}>
                    {ratio * 100}%
                </MenuItem>
            ))}
        </Select>
    )
})

GiveBackSelect.displayName = 'GiveBackSelect'
