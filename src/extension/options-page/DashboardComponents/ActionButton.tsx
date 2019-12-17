import React from 'react'
import { Button, Typography, CircularProgress } from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'

interface ActionButtonProps extends ButtonProps, PropsOf<typeof Button> {
    width?: number | string
    loading?: boolean
    component?: keyof JSX.IntrinsicElements | React.ComponentClass<any>
}

export default function ActionButton<T extends React.ComponentClass<any> = React.ComponentClass<{}>>(
    props: ActionButtonProps & PropsOf<T>,
) {
    const { width, loading, children, className, style, ...p } = props
    return (
        <Button
            disabled={loading}
            startIcon={loading && <CircularProgress size={24} />}
            className={'actionButton ' + className}
            style={{ width, ...style }}
            {...p}>
            <Typography variant="button" children={children}></Typography>
        </Button>
    )
}
