import { Button, ButtonProps, styled } from '@mui/material'
import { forwardRef } from 'react'

const FlexibleTabTabWrap = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean; color?: string }>(({ theme, activated }) => ({
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    background: activated ? '#F2F6FA' : 'transparent',
    borderRadius: `${theme.spacing(1)} !important`,
    color: activated ? '#1C68F3' : theme.palette.text.secondary,
    fontWeight: 'bold',

    '&:hover': {
        color: activated ? '1C68F3' : theme.palette.text.primary,
        background: activated ? theme.palette.background.default : 'transparent',
    },
}))

export interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    onChange?(event: object, value: string): void
}

export const FlexibleTab = forwardRef<HTMLButtonElement, ButtonTabProps>((props, ref) => {
    const activated = !!props.selected
    const { onChange, onClick, value } = props

    const handleClick = (event: any) => {
        if (!activated && onChange) onChange(event, String(value))
        if (onClick) onClick(event)
    }

    return (
        <FlexibleTabTabWrap
            activated={activated}
            ref={ref}
            role="tab"
            {...props}
            disableElevation
            variant="contained"
            aria-selected={activated}
            onClick={handleClick}
            onChange={undefined}
        />
    )
})
