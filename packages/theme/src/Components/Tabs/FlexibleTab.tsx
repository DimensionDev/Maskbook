import { Button, type ButtonProps, styled } from '@mui/material'
import { memo, useEffect, useRef } from 'react'

const FlexibleTabTabWrap = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'activated',
})<{ activated?: boolean; color?: string }>(({ theme, activated }) => ({
    flexShrink: 0,
    flexGrow: 0,
    padding: theme.spacing(1.25, 1.5),
    height: 38,
    lineHeight: '16px',
    minWidth: theme.spacing(3),
    background: activated ? theme.palette.maskColor.input : 'transparent',
    borderRadius: `${theme.spacing(1)} !important`,
    color: activated ? (theme.palette.maskColor.highlight ?? '#1C68F3') : theme.palette.text.secondary,
    fontSize: 14,
    fontWeight: 'bold !important',

    '&:hover': {
        background: activated ? theme.palette.maskColor.input : 'transparent',
        color: activated ? (theme.palette.maskColor.highlight ?? '#1C68F3') : theme.palette.text.primary,
        boxShadow: 'none',
    },
}))

interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    isVisitable: (top: number, right: number) => boolean
    onChange?(event: object, value: string, isUp: boolean): void
}

export const FlexibleTab = memo<ButtonTabProps>((props) => {
    const activated = !!props.selected
    const { onChange, onClick, value } = props
    const { isVisitable, ...rest } = props
    const ref = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!activated) return
        const visitable = isVisitable(
            ref.current?.getBoundingClientRect().top ?? 0,
            ref.current?.getBoundingClientRect().right ?? 0,
        )
        if (!visitable) onChange?.({}, String(value), visitable)
    }, [])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const visitable = isVisitable(
            ref.current?.getBoundingClientRect().top ?? 0,
            ref.current?.getBoundingClientRect().right ?? 0,
        )
        if (!activated && onChange) onChange(event, String(value), visitable)
        if (onClick) onClick(event)
    }

    return (
        <FlexibleTabTabWrap
            activated={activated}
            ref={ref}
            role="tab"
            {...rest}
            disableElevation
            variant="contained"
            aria-selected={activated}
            onClick={handleClick}
            onChange={undefined}
        />
    )
})
