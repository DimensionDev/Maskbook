import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    name: {
        fontSize: 16,
        lineHeight: 1.75,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 400,
    },
}))

interface Props {
    name: string
}

export const FileName: React.FC<Props> = (props) => {
    const { classes } = useStyles()
    return <Typography className={classes.name} children={props.name} title={props.name} />
}
