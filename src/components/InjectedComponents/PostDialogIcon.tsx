import * as React from 'react'
import { makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { MaskbookIcon } from '../../resources/MaskbookIcon'

const useStyles = makeStyles((theme) => ({
    img: {
        verticalAlign: 'middle',
    },
}))

export interface PostDialogIconProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onClick: () => void
}

export function PostDialogIcon(props: PostDialogIconProps) {
    const classes = useStylesExtends(useStyles(), props)
    return (
        <MaskbookIcon
            classes={{
                root: classes.img,
            }}
            onClick={props.onClick}
        />
    )
}
