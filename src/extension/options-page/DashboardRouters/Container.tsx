import React from 'react'
import { makeStyles, createStyles, Typography, Divider, Fade, useMediaQuery, Theme } from '@material-ui/core'
import classNames from 'classnames'
import { getUrl } from '../../../utils/utils'

interface DashboardRouterContainerProps {
    title?: string
    actions?: React.ReactElement[]
    children: React.ReactNode
    /**
     * add or remove the space between divider and left panel
     */
    padded?: boolean
    /**
     * add or remove the placeholder
     */
    empty?: boolean
    /**
     * add or remove the padding of scroller
     */
    compact?: boolean
}

const useStyles = makeStyles((theme) => {
    return createStyles<string, { isSetup: boolean }>({
        wrapper: {
            flex: 1,
            display: 'grid',
            gridTemplateRows: (props) => (props.isSetup ? '1fr' : '[titleAction] 0fr [divider] 0fr [content] auto'),
            height: '100%',
        },
        placeholder: {
            height: '100%',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            backgroundSize: '185px 128px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundImage: `url(${getUrl(
                theme.palette.type === 'light' ? 'dashboard-placeholder.png' : 'dashboard-placeholder-dark.png',
            )})`,
            [theme.breakpoints.down('xs')]: {
                backgroundSize: '100px 70px',
            },
        },
        scroller: {
            height: '100%',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        scrollerCompact: {
            paddingLeft: '0 !important',
            paddingRight: '0 !important',
        },
        titleAction: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 129,
            padding: '40px 24px 40px 34px',
            [theme.breakpoints.down('xs')]: {
                height: 'auto',
                flexDirection: 'column',
                padding: theme.spacing(2, 0),
            },
        },
        title: {
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.2,
            [theme.breakpoints.down('xs')]: {
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.2,
                marginBottom: 0,
            },
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
        },
        contentPadded: {
            '& > *': {
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: 34,
                paddingRight: 24,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
                [theme.breakpoints.down('xs')]: {
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                },
            },
        },
        divider: {
            backgroundColor: theme.palette.divider,
        },
        dividerPadded: {
            padding: '0 24px 0 34px',
            [theme.breakpoints.down('xs')]: {
                padding: theme.spacing(0, 2),
            },
        },
        dividerCompact: {
            [theme.breakpoints.down('xs')]: {
                padding: '0 !important',
            },
        },
        buttons: {
            '& > *': {
                margin: theme.spacing(0, 1),
            },
        },
    })
})

export default function DashboardRouterContainer(props: DashboardRouterContainerProps) {
    const { title, actions, children, padded, empty, compact = false } = props
    const isSetup = location.hash.includes('/setup')
    const classes = useStyles({
        isSetup,
    })
    const xsMatched = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'))

    return (
        <Fade in>
            <section className={classes.wrapper}>
                {isSetup ? null : (
                    <>
                        <section className={classes.titleAction}>
                            <Typography className={classes.title} color="textPrimary" variant="h6">
                                {title}
                            </Typography>
                            <div className={classes.buttons}>
                                {actions?.map((action, index) => React.cloneElement(action, { key: index }))}
                            </div>
                        </section>
                        <div
                            className={classNames({
                                [classes.dividerPadded]: padded !== false,
                                [classes.dividerCompact]: compact !== false,
                            })}>
                            <Divider className={classes.divider} />
                        </div>
                    </>
                )}
                <main className={classNames(classes.content, { [classes.contentPadded]: padded !== false })}>
                    <div className={classNames(classes.scroller, { [classes.scrollerCompact]: compact !== false })}>
                        {children}
                    </div>
                    {empty ? <div className={classes.placeholder}></div> : null}
                </main>
            </section>
        </Fade>
    )
}
