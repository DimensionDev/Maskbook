import { Button, ButtonProps, styled } from '@mui/material'
import { forwardRef } from 'react'

const BaseTabWrap = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean; color?: string }>(({ theme, activated }) => ({
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    boxShadow: activated ? '0px 0px 20px rgba(0, 0, 0, 0.05)' : 'none',
    background: activated ? theme.palette.background.paper : 'transparent',
    borderRadius: `${theme.spacing(1.5)} ${theme.spacing(1.5)} 0px 0px !important`,
    color: activated ? theme.palette.text.primary : theme.palette.text.secondary,
    fontWeight: 'bold',

    '&:hover': {
        boxShadow: activated ? '0px 0px 20px rgba(0, 0, 0, 0.05)' : 'none',
        background: activated ? theme.palette.background.default : 'transparent',
    },
}))

export interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    onChange?(event: object, value: string): void
}

export const BaseTab = forwardRef<HTMLButtonElement, ButtonTabProps>((props, ref) => {
    const activated = !!props.selected
    const { onChange, onClick, value } = props

    const handleClick = (event: any) => {
        if (!activated && onChange) onChange(event, String(value))
        if (onClick) onClick(event)
    }

    return (
        <BaseTabWrap
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
