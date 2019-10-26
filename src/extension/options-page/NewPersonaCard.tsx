import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import { Link } from 'react-router-dom'
import CardContent from '@material-ui/core/CardContent'
import AddIcon from '@material-ui/icons/Add'
const useStyles = makeStyles(theme =>
    createStyles({
        card: {
            minWidth: 375,
            margin: theme.spacing(2),
            textAlign: 'center',
        },
        container: {
            marginBottom: theme.spacing(1),
        },
        rounded: {
            display: 'inline-flex',
            height: '3.5rem',
            width: '3.5rem',
            margin: 10,
            borderRadius: '50%',
            backgroundColor: 'rgb(238,238,238)',
            justifyContent: 'center',
            alignItems: 'center',
        },
    }),
)

export default function NewPersonaCard() {
    const classes = useStyles()

    return (
        <Card className={classes.card} raised elevation={3}>
            <CardContent>
                <Link color="textPrimary" to={'/welcome'} className={classes.container}>
                    <span className={classes.rounded}>
                        <AddIcon fontSize="large" />
                    </span>
                </Link>
                <div>Add New Persona</div>
            </CardContent>
        </Card>
    )
}
