import { Button, ButtonProps, styled } from '@mui/material'
import { forwardRef } from 'react'

const BaseTabWrap = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean }>(({ theme, activated }) => ({
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: 36,
    lineHeight: '18px',
    boxShadow: activated
        ? `0px 0px 20px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)'}`
        : 'none',
    background: activated ? theme.palette.maskColor.bottom : 'transparent',
    borderRadius: `${theme.spacing(1.5)} ${theme.spacing(1.5)} 0px 0px !important`,
    color: activated ? theme.palette.maskColor.main : theme.palette.maskColor.secondaryDark,
    fontSize: 16,
    fontWeight: 'bold',

    '&:hover': {
        boxShadow: activated ? '0 0 20px rgba(0, 0, 0, 0.05)' : 'none',
        background: activated ? theme.palette.maskColor.bottom : 'transparent',
        color: theme.palette.maskColor.main,
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

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
            onClick={(e) => handleClick(e)}
            onChange={undefined}
        />
    )
})
