import { createStyles, makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { Card } from '@material-ui/core'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            '--contentHeight': '400px',
            '--tabHeight': '35px',

            width: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
        },
    })
})

export interface CollectibleCardProps extends withClasses<'root'> {
    children?: React.ReactNode
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { children } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Card className={classes.root} elevation={0}>
            {children}
        </Card>
    )
}
