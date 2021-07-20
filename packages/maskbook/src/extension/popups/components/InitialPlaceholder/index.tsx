import { memo } from 'react'
import { makeStyles, Box, Button } from '@material-ui/core'
import { useEnter } from '../../hook/useEnter'

const useStyles = makeStyles(() => ({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 10px',
    },
    button: {
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        lineHeight: 1.5,
        borderRadius: 20,
    },
}))

export const InitialPlaceholder = memo(({ children }) => {
    const classes = useStyles()

    const onEnter = useEnter()

    return (
        <Box className={classes.container}>
            <Box className={classes.placeholder}>{children}</Box>
            <Button variant="contained" color="primary" className={classes.button} onClick={onEnter}>
                Enter Dashboard
            </Button>
        </Box>
    )
})
