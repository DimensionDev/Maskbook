import React from 'react'
import { makeStyles, createStyles, Typography, Divider, Fade } from '@material-ui/core'
import classNames from 'classnames'

interface DashboardRouterContainer {
    title: string
    actions?: React.ReactElement[]
    children: React.ReactNode
    padded?: boolean
}

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            flex: 1,
            display: 'grid',
            gridTemplateRows: '[titleAction] 0fr [divider] 0fr [content] auto',
        },
        titleAction: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '90px',
            padding: theme.spacing(3, 2, 3, 4),
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
        },
        contentPadded: {
            padding: theme.spacing(0, 3),
        },
        buttons: {
            '& > *': {
                margin: theme.spacing(0, 1),
            },
        },
    }),
)

export default function DashboardRouterContainer(props: DashboardRouterContainer) {
    const { title, actions, children, padded } = props
    const classes = useStyles()
    return (
        <Fade in>
            <section className={classes.wrapper}>
                <section className={classes.titleAction}>
                    <Typography variant="h5">{title}</Typography>
                    <div className={classes.buttons}>
                        {actions?.map((action, index) => React.cloneElement(action, { key: index }))}
                    </div>
                </section>
                <div className={classNames({ [classes.contentPadded]: padded !== false })}>
                    <Divider />
                </div>
                <main className={classNames(classes.content, { [classes.contentPadded]: padded !== false })}>
                    {children}
                </main>
            </section>
        </Fade>
    )
}
