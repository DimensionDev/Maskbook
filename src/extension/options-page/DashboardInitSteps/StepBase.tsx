import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { CardContent, CardActions, CardHeader } from '@material-ui/core'

const useStyles = makeStyles({
    cardHeader: {
        flex: '0 0 auto',
        height: 92,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&>*': {
            textAlign: 'center',
        },
    },
    cardContent: {
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardActions: {
        flex: '0 0 auto',
        height: 84,
        display: 'flex',
        justifyContent: 'space-between',
        '& .actionButton': {
            width: 140,
        },
        '& > div': {
            margin: 'auto',
        },
    },
})

interface StepBaseProps {
    header?: string
    subheader?: string
    children?: string | JSX.Element
    actions?: JSX.Element
}

export default function StepBase(props: StepBaseProps) {
    const classes = useStyles()
    const { header, subheader, children, actions } = props
    return (
        <>
            <CardHeader className={classes.cardHeader} title={header} subheader={subheader}></CardHeader>
            <CardContent className={classes.cardContent}>{children}</CardContent>
            <CardActions className={classes.cardActions}>{actions || null}</CardActions>
        </>
    )
}
