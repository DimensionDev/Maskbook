import { makeStyles, Typography } from '@material-ui/core'
import { memo } from 'react'

const useStyles = makeStyles((theme) => ({
    name: {
        fontSize: 16,
    },
}))

export interface FilePathProps {
    name: string
}
export const FilePath = memo<FilePathProps>(({ name }) => {
    const classes = useStyles()
    return (
        <Typography variant="body1" className={classes.name}>
            {name}
        </Typography>
    )
})
