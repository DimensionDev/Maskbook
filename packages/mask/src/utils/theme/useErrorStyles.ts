import { makeStyles } from '@masknet/theme'
import { red } from '@mui/material/colors'

export const useErrorStyles = makeStyles()((theme) => {
    const dark = theme.palette.mode === 'dark'
    return {
        containedPrimary: {
            backgroundColor: dark ? red[500] : red[900],
            '&:hover': {
                backgroundColor: dark ? red[900] : red[700],
            },
        },
        outlinedPrimary: {
            borderColor: dark ? red[500] : red[900],
            color: dark ? red[500] : red[900],
            '&:hover': {
                borderColor: dark ? red[900] : red[700],
            },
        },
    }
})
