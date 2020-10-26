import React from 'react'
import {
    makeStyles,
    createStyles,
    Typography,
    Divider,
    Fade,
    IconButton,
    useMediaQuery,
    Theme,
} from '@material-ui/core'
import classNames from 'classnames'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import { getUrl } from '../../../utils/utils'
import { useHistory } from 'react-router-dom'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'

interface DashboardRouterContainerProps {
    title?: string
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
    /**
     * (mobile only)
     * icons on the left of title
     */
    leftIcons?: React.ReactElement[]

    /**
     * (mobile only)
     * icons onthe right of title
     */
    rightIcons?: React.ReactElement[]

    /**
     * (pc only)
     * buttons on the right of title
     */
    actions?: React.ReactElement[]
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
            [theme.breakpoints.down('sm')]: {
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
        title: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 129,
            padding: '40px 24px 40px 34px',
            [theme.breakpoints.down('sm')]: {
                height: 'auto',
                padding: theme.spacing(1, 2),
                backgroundColor: theme.palette.type === 'light' ? theme.palette.primary.main : 'transparent',
            },
        },
        titleContent: {
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.2,
            [theme.breakpoints.down('sm')]: {
                color: theme.palette.type === 'light' ? theme.palette.common.white : theme.palette.text.primary,
                left: 0,
                right: 0,
                pointerEvents: 'none',
                position: 'absolute',
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.2,
                textAlign: 'center',
                marginBottom: 0,
            },
        },
        titleIcon: {
            color: theme.palette.type === 'light' ? theme.palette.common.white : theme.palette.text.primary,
            padding: theme.spacing(1),
        },
        titlePlaceholder: {
            flex: 1,
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
                [theme.breakpoints.down('sm')]: {
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                },
            },
        },
        divider: {
            borderColor: theme.palette.divider,
            [theme.breakpoints.down('sm')]: {
                display: theme.palette.type === 'light' ? 'none' : 'block',
            },
        },
        dividerPadded: {
            padding: '0 24px 0 34px',
            [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(0, 2),
            },
        },
        dividerCompact: {
            [theme.breakpoints.down('sm')]: {
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
    const { title, actions, children, padded, empty, compact = false, leftIcons = [], rightIcons = [] } = props
    const isSetup = location.hash.includes('/setup')
    const classes = useStyles({
        isSetup,
    })
    const history = useHistory()
    const xsMatched = useMatchXS()

    if (xsMatched && !leftIcons.length) {
        leftIcons.push(
            <IconButton onClick={() => history.goBack()}>
                <ArrowBackIosIcon />
            </IconButton>,
        )
    }

    return (
        <Fade in>
            <section className={classes.wrapper}>
                {isSetup ? null : (
                    <>
                        <section className={classes.title}>
                            {xsMatched
                                ? leftIcons?.map((icon, index) =>
                                      React.cloneElement(icon, {
                                          key: index,
                                          size: 'small',
                                          className: classes.titleIcon,
                                      }),
                                  )
                                : null}
                            <Typography className={classes.titleContent} color="textPrimary" variant="h6">
                                {title}
                            </Typography>
                            {xsMatched ? <div className={classes.titlePlaceholder}></div> : null}
                            {xsMatched
                                ? rightIcons?.map((icon, index) =>
                                      React.cloneElement(icon, {
                                          key: index,
                                          size: 'small',
                                          className: classes.titleIcon,
                                      }),
                                  )
                                : null}
                            {xsMatched ? null : (
                                <div className={classes.buttons}>
                                    {actions?.map((action, index) => React.cloneElement(action, { key: index }))}
                                </div>
                            )}
                        </section>
                        <div
                            className={classNames({
                                [classes.dividerPadded]: padded !== false,
                                [classes.dividerCompact]: xsMatched,
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
