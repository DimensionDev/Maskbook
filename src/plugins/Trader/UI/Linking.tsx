import React from 'react'
import { Link } from '@material-ui/core'

export interface LinkingProps {
    href?: string
    children?: React.ReactNode
}

export function Linking(props: LinkingProps) {
    return props.href ? (
        <Link color="primary" target="_blank" rel="noopener noreferrer" href={props.href}>
            {props.children}
        </Link>
    ) : null
}
