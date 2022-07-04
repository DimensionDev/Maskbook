import { Button, ButtonProps, styled } from '@mui/material'
import { forwardRef } from 'react'

const RoundTabWrap = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean }>(({ theme, activated }) => ({
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: 34,
    lineHeight: '16px',
    boxShadow: activated
        ? `0px 0px 20px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)'}`
        : 'none',
    background: activated ? theme.palette.maskColor.bottom : 'transparent',
    borderRadius: `${theme.spacing(2)} !important`,
    color: activated ? theme.palette.text.primary : theme.palette.text.secondary,
    fontSize: 14,
    fontWeight: 'bold',

    '&:hover': {
        color: theme.palette.text.primary,
        boxShadow: activated ? ' 0px 2px 5px 1px rgba(0, 0, 0, 0.05);' : 'none',
        background: activated ? theme.palette.maskColor.bottom : 'transparent',
    },
}))

export interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    onChange?(event: object, value: string): void
}

export const RoundTab = forwardRef<HTMLButtonElement, ButtonTabProps>((props, ref) => {
    const activated = !!props.selected
    const { onChange, onClick, value } = props

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!activated && onChange) onChange(event, String(value))
        if (onClick) onClick(event)
    }

    return (
        <RoundTabWrap
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
