import { Button, type ButtonProps, styled } from '@mui/material'
import { type ComponentType } from 'react'

const BaseTabWrap: ComponentType<ButtonProps & { activated: boolean }> = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean }>(({ theme, activated }) => ({
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: 36,
    lineHeight: '18px',
    boxShadow:
        activated ?
            `0px 0px 20px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)'}`
        :   'none',
    background: activated ? theme.palette.maskColor.bottom : 'transparent',
    borderRadius: `${theme.spacing(1.5)} ${theme.spacing(1.5)} 0px 0px !important`,
    color: activated ? theme.palette.maskColor.main + ' !important' : theme.palette.maskColor.secondaryDark,
    fontSize: 16,
    fontWeight: 'bold',

    '&:hover': {
        boxShadow: activated ? '0 0 20px rgba(0, 0, 0, 0.05)' : 'none',
        background: activated ? theme.palette.maskColor.bottom : 'transparent',
    },
    // If there is only single one tab.
    '&:first-of-type:last-of-type': {
        maxWidth: '25%',
    },
}))

interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    onChange?(event: object, value: string): void
}

export function BaseTab(props: ButtonTabProps) {
    const activated = !!props.selected
    const { onChange, onClick, value } = props

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!activated && onChange) onChange(event, String(value))
        if (onClick) onClick(event)
    }

    return (
        <BaseTabWrap
            activated={activated}
            role="tab"
            {...props}
            disableElevation
            variant="contained"
            aria-selected={activated}
            onClick={(e) => handleClick(e)}
            onChange={undefined}
        />
    )
}
