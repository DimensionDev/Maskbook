import { makeStyles, Paper } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { ToolbarPlaceholder } from './ToolbarPlaceholder'

const useStyle = makeStyles((theme) => {
    return {
        root: {
            borderRadius: 0,
            height: 54,
            position: 'relative',
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
    }
})

export interface ToolbarProps extends withClasses<never> {}

export function Toolbar(props: ToolbarProps) {
    const classes = useStylesExtends(useStyle(), props)

    return (
        <Paper className={classes.root} elevation={0}>
            <span>This is toolbar.</span>
            <ToolbarPlaceholder />
        </Paper>
    )
}
