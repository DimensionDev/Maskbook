import { Card } from '@mui/material'

interface CollectiblePaperProps extends withClasses<'root'> {
    children?: React.ReactNode
}

export function CollectiblePaper(props: CollectiblePaperProps) {
    const { children } = props
    const classes = props.classes

    return (
        <Card className={classes?.root} elevation={0}>
            {children}
        </Card>
    )
}
