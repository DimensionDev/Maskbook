import { makeStyles, Paper } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'

const useStyle = makeStyles((theme) => {
    return {
        root: {
            borderRadius: 0,
            position: 'relative',
        },
    }
})

export interface ToolbarProps extends withClasses<'root'> {
    children: React.ReactNode
}

export function Toolbar(props: ToolbarProps) {
    const classes = useStylesExtends(useStyle(), props)

    return (
        <Paper className={classes.root} elevation={0}>
            {props.children}
        </Paper>
    )
}
