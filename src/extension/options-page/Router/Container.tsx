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
            height: '100%',
        },
        scroller: {
            height: '100%',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        titleAction: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 129,
            padding: '40px 24px 40px 34px',
        },
        title: {
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: '48px',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        },
        dividerPadded: {
            paddingLeft: 34,
            paddingRight: 24,
        },
        divider: {
            backgroundColor: theme.palette.divider,
        },
        contentPadded: {
            '& > * ': {
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: 34,
                paddingRight: 24,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
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
                    <Typography className={classes.title} color="textPrimary" variant="h6">
                        {title}
                    </Typography>
                    <div className={classes.buttons}>
                        {actions?.map((action, index) => React.cloneElement(action, { key: index }))}
                    </div>
                </section>
                <div className={classNames({ [classes.dividerPadded]: padded !== false })}>
                    <Divider className={classes.divider} />
                </div>
                <main className={classNames(classes.content, { [classes.contentPadded]: padded !== false })}>
                    <div className={classes.scroller}>{children}</div>
                </main>
            </section>
        </Fade>
    )
}
