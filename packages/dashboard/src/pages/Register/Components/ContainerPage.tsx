import { InfoIcon, MaskTransparentLogo } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { Link, makeStyles, Typography } from '@material-ui/core'
import { memo } from 'react'
import { useDashboardI18N } from '../../../locales/i18n_generated'

const useStyles = makeStyles((theme) => ({
    container: {
        height: '100vh',
        display: 'flex',
    },
    leftContainer: {
        maxWidth: 500,
        width: '100%',
        backgroundColor: MaskColorVar.blue,
        paddingTop: theme.spacing(4),
        paddingLeft: theme.spacing(4),
        '& > svg': {
            width: 128,
            height: 'auto',
        },
    },
    rightContainer: {
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    goback: {
        textAlign: 'right',
        paddingTop: theme.spacing(8),
        paddingRight: theme.spacing(8),
        fontSize: 13,
        outline: 'none',
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: theme.spacing(4),
        margin: 'auto',
    },
    tip: {
        backgroundColor: MaskColorVar.infoBackground,
        maxWidth: 800,
        flexDirection: 'row',
        display: 'flex',
        borderRadius: Number(theme.shape.borderRadius) * 2,
        padding: theme.spacing(2),
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(1),
    },
}))

export interface ContainerPageProps {
    children?: React.ReactElement
    goback?: React.ReactElement
}

export const ContainerPage = memo<ContainerPageProps>(({ children, goback }) => {
    const classes = useStyles()
    const t = useDashboardI18N()

    return (
        <div className={classes.container}>
            <div className={classes.leftContainer}>
                <MaskTransparentLogo fontSize="inherit" />
            </div>
            <div className={classes.rightContainer}>
                <div className={classes.goback}>{goback ?? <Link>Go back</Link>}</div>
                <div className={classes.wrapper}>{children}</div>
                <div className={classes.footer}>
                    <div className={classes.tip}>
                        <div className={classes.icon}>
                            <InfoIcon />
                        </div>
                        <div>
                            <Typography variant="body2" color="textSecondary">
                                As the defender of open-source software and user data privacy, Mask Network does not
                                collect your private data such as account and password. If you need to retrieve your
                                password, please authorize us to host your account and password. Please rest assured
                                that we simply host your account and password. We do not save any of your private data.
                                Consequently, we cannot restore your data or any other information.
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
