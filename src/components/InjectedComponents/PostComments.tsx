import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import Lock from '@material-ui/icons/Lock'

const useStyle = makeStyles({
    root: {
        height: 'auto',
        padding: '6px',
    },
    label: {
        whiteSpace: 'initial',
    },
})
export function PostCommentDecrypted(props: React.PropsWithChildren<{}>) {
    const style = useStyle()
    return (
        <>
            <Chip classes={style} icon={<Lock />} label={props.children} color="secondary" />
        </>
    )
}
