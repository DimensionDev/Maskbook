import React from 'react'
import { Button, Typography } from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'

interface ButtoneProps extends ButtonProps {
    width?: number | string
    // TODO: figure out type
    [key: string]: any
}

export default function ActionButton(props: ButtoneProps) {
    const { width, children, className, ...p } = props
    return (
        <Button className={'actionButton ' + className} style={{ width }} {...p}>
            <Typography variant="button" children={children}></Typography>
        </Button>
    )
}
