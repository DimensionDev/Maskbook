import { makeStyles, Typography, ThemeProvider } from '@material-ui/core'
import { getActivatedUI } from '../social-network/ui'
import { MaskbookIcon } from '../resources/MaskbookIcon'

interface PluginWrapperProps {
    pluginName: string
    children?: JSX.Element | string
    width?: number
}

const useStyles = makeStyles((theme) => {
    const network = getActivatedUI()?.networkIdentifier
    return {
        card: {
            marginTop: theme.spacing(1),
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${theme.palette.divider}`,
            cursor: 'default',
            ...(network === 'twitter.com'
                ? {
                      borderRadius: 15,
                      overflow: 'hidden',
                  }
                : null),
        },
        header: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(1, 2),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        title: {
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: theme.spacing(1),
        },
        icon: {
            width: '3em',
            height: '3em',
        },
        body: {
            margin: theme.spacing(2),
        },
    }
})

export default function MaskbookPluginWrapper(props: PluginWrapperProps) {
    const classes = useStyles()
    const { pluginName, children } = props
    return (
        <ThemeProvider theme={getActivatedUI().useTheme()}>
            <div className={classes.card} onClick={(ev) => ev.stopPropagation()}>
                <div className={classes.header}>
                    <MaskbookIcon className={classes.icon}></MaskbookIcon>
                    <div className={classes.title}>
                        <Typography variant="overline">Mask Plugin</Typography>
                        <Typography variant="h6">{pluginName}</Typography>
                    </div>
                </div>
                <div className={classes.body}>{children}</div>
            </div>
        </ThemeProvider>
    )
}
