import React from 'react'
import { Button, Typography, CircularProgress } from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'

interface ActionButtonProps extends ButtonProps {
    width?: number | string
    loading?: boolean
    // TODO: figure out type
    [key: string]: any
}

export default function ActionButton(props: ActionButtonProps) {
    const { width, loading, children, className, ...p } = props
    return (
        <Button
            disabled={loading}
            startIcon={loading && <CircularProgress size={24} />}
            className={'actionButton ' + className}
            style={{ width }}
            {...p}>
            <Typography variant="button" children={children}></Typography>
        </Button>
    )
}
