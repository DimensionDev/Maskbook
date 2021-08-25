import { cloneElement } from 'react'
import { Typography, Divider, Fade, Fab, PropTypes } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { Flags } from '../../../utils/flags'

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
     * fab on the right bottom position of page
     */
    floatingButtons?: { icon: React.ReactElement; handler: () => void }[]

    /**
     * (pc only)
     * buttons on the right of title
     */
    actions?: React.ReactElement[]
}

const FAB_COLORS: PropTypes.Color[] = ['primary', 'secondary', 'default']
const useStyles = makeStyles<{ isSetup: boolean }>()((theme, props) => ({
    wrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
        [theme.breakpoints.up('sm')]: {
            display: Flags.has_native_nav_bar ? 'inline' : 'grid',
            gridTemplateRows: props.isSetup ? '1fr' : '[titleAction] 0fr [divider] 0fr [content] auto',
        },
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
        backgroundImage: `url(${
            theme.palette.mode === 'light'
                ? new URL('./dashboard-placeholder.png', import.meta.url)
                : new URL('./dashboard-placeholder-dark.png', import.meta.url)
        })`,
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
        height: 110,
        padding: theme.spacing(4, 3),
    },
    titleContent: {
        color: theme.palette.text.primary,
        fontWeight: 500,
        fontSize: 32,
        lineHeight: 1.2,
        [theme.breakpoints.down('sm')]: {
            color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.text.primary,
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
    FloatingIcon: {
        color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.text.primary,
        padding: theme.spacing(1),
        fontSize: '2.5rem',
    },
    titlePlaceholder: {
        flex: 1,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            height: '100vh',
        },
    },
    contentPadded: {
        '& > *': {
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(0, 3),
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
            display: theme.palette.mode === 'light' ? 'none' : 'block',
        },
    },
    dividerPadded: {
        padding: theme.spacing(0, 3),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(0, 2),
        },
    },
    dividerCompact: {
        padding: '0 !important',
    },
    buttons: {
        display: 'flex',
        '& > *': {
            marginLeft: theme.spacing(1) + '!important',
        },
    },
    floatButtonContainer: {
        position: 'fixed',
        bottom: theme.spacing(1),
        right: theme.spacing(2),
    },
    floatingButton: {
        display: 'flex',
        justifyItems: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
}))

export default function DashboardRouterContainer(props: DashboardRouterContainerProps) {
    const { title, actions, children, padded, empty, compact = false, floatingButtons = [] } = props
    const isSetup = location.hash.includes('/setup')
    const { classes } = useStyles({
        isSetup,
    })
    const xsMatched = useMatchXS()

    return (
        <Fade in>
            <section className={classes.wrapper}>
                {isSetup ? null : (
                    <>
                        {Flags.has_native_nav_bar ? null : (
                            <>
                                <section className={classes.title}>
                                    <Typography className={classes.titleContent} color="textPrimary" variant="h6">
                                        {title}
                                    </Typography>

                                    {Flags.has_native_nav_bar ? null : (
                                        <div className={classes.buttons}>
                                            {actions?.map((action, index) => cloneElement(action, { key: index }))}
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
                    </>
                )}
                <main className={classNames(classes.content, { [classes.contentPadded]: padded !== false })}>
                    <div className={classNames(classes.scroller, { [classes.scrollerCompact]: compact !== false })}>
                        {children}
                    </div>
                    {empty ? <div className={classes.placeholder} /> : null}
                </main>
                <div className={classes.floatButtonContainer}>
                    {Flags.has_native_nav_bar
                        ? floatingButtons?.map((floatingButton, index) => (
                              <Fab
                                  color={FAB_COLORS[index]}
                                  className={classes.floatingButton}
                                  onClick={floatingButton.handler}>
                                  {cloneElement(floatingButton.icon, {
                                      key: index,
                                      className: classes.FloatingIcon,
                                  })}
                              </Fab>
                          ))
                        : null}
                </div>
            </section>
        </Fade>
    )
}
