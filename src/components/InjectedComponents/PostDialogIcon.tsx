import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'

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
    return <img className={classes.img} width="20" height="20" src={getUrl('/256x256.png')} onClick={props.onClick} />
}
