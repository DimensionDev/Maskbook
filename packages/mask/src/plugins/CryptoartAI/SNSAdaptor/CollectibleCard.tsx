import { Card } from '@mui/material'
export interface CollectibleCardProps extends withClasses<'root'> {
    children?: React.ReactNode
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { children } = props
    const classes = props.classes
    return (
        <Card className={classes?.root} elevation={0}>
            {children}
        </Card>
    )
}
