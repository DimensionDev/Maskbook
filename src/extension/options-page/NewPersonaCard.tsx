import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import { Link } from 'react-router-dom'
import CardContent from '@material-ui/core/CardContent'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import { Avatar } from '@material-ui/core'
import { geti18nString } from '../../utils/i18n'
const useStyles = makeStyles(theme =>
    createStyles({
        card: {
            width: 'auto',
            margin: theme.spacing(2),
            textAlign: 'center',
        },
        container: {
            marginBottom: theme.spacing(1),
        },
        avatar: {
            height: '3.5rem',
            width: '3.5rem',
            ...(theme.palette.type === 'dark'
                ? {}
                : { backgroundColor: 'rgb(238,238,238)', color: 'rgb(118,118,118)' }),
        },
    }),
)

export default function NewPersonaCard() {
    const classes = useStyles()

    return (
        <Card className={classes.card} raised elevation={3}>
            <CardContent>
                <Link component={Button} to={'/welcome'} className={classes.container}>
                    <Avatar className={classes.avatar}>
                        <AddIcon fontSize="large" />
                    </Avatar>
                </Link>
                <div>{geti18nString('dashboard_add_new_persona')}</div>
            </CardContent>
        </Card>
    )
}
