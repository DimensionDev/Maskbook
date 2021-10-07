import { Typography } from '@material-ui/core'

interface Props extends React.PropsWithChildren<{}> {
    description: string
}

function FoudationDescription(props: Props) {
    return (
        <Typography variant="body1" gutterBottom>
            {props.description}
        </Typography>
    )
}

export default FoudationDescription
