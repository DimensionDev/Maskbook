import { Button, type ButtonProps, styled } from '@mui/material'

const RoundTabWrap = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean }>(({ theme, activated }) => ({
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: 34,
    lineHeight: '16px',
    background: activated ? theme.palette.maskColor.bottom : 'transparent',
    borderRadius: `${theme.spacing(2)} !important`,
    color: activated ? theme.palette.text.primary : theme.palette.text.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    boxShadow: activated ? ' 0px 2px 5px 1px rgba(0, 0, 0, 0.05);' : 'none',

    '&:hover': {
        boxShadow: activated ? ' 0px 2px 5px 1px rgba(0, 0, 0, 0.05);' : 'none',
        color: theme.palette.text.primary,
        background: activated ? theme.palette.maskColor.bottom : 'transparent',
    },
}))

interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    onChange?(event: object, value: string): void
}

export function RoundTab(props: ButtonTabProps) {
    const activated = !!props.selected
    const { onChange, onClick, value } = props

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!activated && onChange) onChange(event, String(value))
        if (onClick) onClick(event)
    }

    return (
        <RoundTabWrap
            activated={activated}
            role="tab"
            {...props}
            disableElevation
            variant="contained"
            aria-selected={activated}
            onClick={handleClick}
            onChange={undefined}
        />
    )
}
