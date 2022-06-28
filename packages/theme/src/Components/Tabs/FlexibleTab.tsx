import { Button, ButtonProps, styled } from '@mui/material'
import { memo, useRef } from 'react'
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
    color: activated ? get(theme.palette, 'maskColor.primary') ?? '#1C68F3' : theme.palette.text.secondary,
    fontSize: 14,
    fontWeight: 'bold !important',

    '&:hover': {
        background: activated ? get(theme.palette.background, 'input') ?? '#F2F6FA' : 'transparent',
        color: activated ? get(theme.palette, 'maskColor.primary') ?? '#1C68F3' : theme.palette.text.primary,
        boxShadow: 'none',
    },
}))

export interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    isVisitable: (top: number, right: number) => boolean
    onChange?(event: object, value: string, isUp: boolean): void
}

export const FlexibleTab = memo<ButtonTabProps>((props) => {
    const activated = !!props.selected
    const { onChange, onClick, value } = props
    const ref = useRef<HTMLButtonElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const isVisitable = props.isVisitable(
            ref.current?.getBoundingClientRect().top ?? 0,
            ref.current?.getBoundingClientRect().right ?? 0,
        )
        if (!activated && onChange) onChange(event, String(value), isVisitable)
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
