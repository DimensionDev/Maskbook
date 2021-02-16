import { makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { ToolbarPlaceholder } from './ToolbarPlaceholder'

const useStyle = makeStyles({
    root: {
        height: 64,
        backgroundColor: '#fff',
        zIndex: 1,
        position: 'relative',
    },
})

export interface ToolbarProps extends withClasses<never> {}

export function Toolbar(props: ToolbarProps) {
    const classes = useStylesExtends(useStyle(), props)

    return (
        <div className={classes.root}>
            <span>This is toolbar.</span>
            <ToolbarPlaceholder />
        </div>
    )
}
