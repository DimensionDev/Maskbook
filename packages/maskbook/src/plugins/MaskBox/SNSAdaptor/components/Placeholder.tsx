import { Typography } from '@material-ui/core'

export interface PlaceholderProps {
    children?: React.ReactNode
}

export function Placeholder(props: PlaceholderProps) {
    return <Typography color="textPrimary">{props.children}</Typography>
}
