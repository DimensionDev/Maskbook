import { makeStyles } from '@material-ui/styles'

export const useTwtterComponent = makeStyles({
    button: {
        fontWeight: 'bold',
        minHeight: 39,
        borderRadius: 9999,
        boxShadow: 'none',
        backgroundColor: 'rgb(29, 161, 242)',
        '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'rgb(26, 145, 218)',
        },
    },
})
