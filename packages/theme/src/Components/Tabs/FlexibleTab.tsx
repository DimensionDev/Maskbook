import { Button, ButtonProps, styled } from '@mui/material'
import { forwardRef } from 'react'
import { get } from 'lodash-unified'

const FlexibleTabTabWrap = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean; color?: string }>(({ theme, activated }) => ({
    flexShrink: 0,
    flexGrow: 0,
    padding: theme.spacing(1.25, 1.5),
    height: 38,
    lineHeight: '16px',
    minWidth: theme.spacing(3),
    background: activated ? get(theme.palette.background, 'input') ?? '#F2F6FA' : 'transparent',
    borderRadius: `${theme.spacing(1)} !important`,
    // TODO: should remove 'get'
    color: activated ? get(theme.palette, 'public.primary') ?? '#1C68F3' : theme.palette.text.secondary,
    fontSize: 14,
    fontWeight: 'bold',

    '&:hover': {
        background: activated ? get(theme.palette.background, 'input') ?? '#F2F6FA' : 'transparent',
        color: activated ? get(theme.palette, 'public.primary') ?? '#1C68F3' : theme.palette.text.primary,
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

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
