import React from 'react'
import { Chip } from '@material-ui/core'
import Lock from '@material-ui/icons/Lock'

export function PostCommentDecrypted(props: React.PropsWithChildren<{}>) {
    return (
        <>
            <Chip icon={<Lock />} label={props.children} color="secondary" />
        </>
    )
}
