import { Alert, Typography, Button, Box, createStyles } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '../../../components/custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            borderRadius: 10,
            width: '100%',
            background: 'linear-gradient(90deg, #FE686F 0%, #F78CA0 100%);',
            marginTop: theme.spacing(2.5),
        },
        content: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: theme.spacing(2.5),
        },
        ITOAlertContainer: {
            padding: theme.spacing(0, 2.5, 2.5, 2.5),
        },
        ITOAlert: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
        },
        button: {
            background: 'rgba(255,255,255,.2)',
        },
    }),
)

export interface ITO_CardProps extends withClasses<never> {}

export function ITO_Card(props: ITO_CardProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Box className={classes.root}>
            <Box className={classes.content}>
                <Box display="flex" flexDirection="column" justifyContent="space-between">
                    <Typography>ITO locked:</Typography>
                    <Typography>50.00</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Button disabled className={classes.button}>
                        Claim
                    </Button>
                </Box>
            </Box>
            <Box className={classes.ITOAlertContainer}>
                <Alert icon={false} className={classes.ITOAlert}>
                    ITO Mask unlock time is 02/26/2021 03:00 AM (UTC+0).
                </Alert>
            </Box>
        </Box>
    )
}
