import { makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '@masknet/shared'
import { Card } from '@material-ui/core'

const useStyles = makeStyles((theme) => {
    return {}
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
