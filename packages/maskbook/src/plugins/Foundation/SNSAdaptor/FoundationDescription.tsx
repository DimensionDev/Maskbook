import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        description: {
            margin: theme.spacing(2, 0, 2, 0),
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    description: string
}

function FoundationDescription(props: Props) {
    const { classes } = useStyles()
    return (
        <Typography className={classes.description} variant="body1" gutterBottom>
            {props.description}
        </Typography>
    )
}

export default FoundationDescription
