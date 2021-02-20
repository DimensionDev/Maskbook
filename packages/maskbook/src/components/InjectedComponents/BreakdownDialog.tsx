import {
    DialogContent,
    Button,
    createStyles,
    Typography,
    Box,
    OutlinedInput,
    Alert,
    DialogProps,
} from '@material-ui/core'
import { Info as InfoIcon } from '@material-ui/icons'
import { InjectedDialog } from '../shared/InjectedDialog'
import { makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '../custom-ui-helper'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { AirdropIcon } from '../../resources/AirdropIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        dialogPaper: {
            background: 'linear-gradient(180.43deg, #04277B 26.69%, #6B94F2 99.57%)',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: theme.spacing(6.25, 4.375),
            color: '#fff',
        },
        dialogTitle: {
            backgroundColor: '#04277B',
            color: '#fff',
            borderBottom: 'none !important',
        },
        logo: {
            width: 96,
            height: 96,
        },
        amount: {
            fontSize: 32,
            marginTop: theme.spacing(5),
        },
        balance: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            width: '100%',
            margin: theme.spacing(3.75, 0, 2.5),
        },
        airDropContainer: {
            background: 'linear-gradient(90deg, #2174F6 0%, #00C6FB 100%)',
            borderRadius: 10,
            width: '100%',
        },
        airdropContent: {
            borderBottom: '1px dashed rgba(255,255,255, 0.5)',
            padding: theme.spacing(2.5),
            display: 'flex',
            justifyContent: 'space-between',
            color: '#fff',
            fontSize: 14,
            position: 'relative',
        },
        checkAddress: {
            padding: theme.spacing(2.5),
            fontSize: 13,
            color: '#fff',
        },
        airDropIcon: {
            width: 70,
            height: 79,
            position: 'absolute',
            left: '17%',
            top: 5,
        },
        checkAddressInput: {
            flex: 1,
            height: 48,
            color: '#fff',
            '& > fieldset': {
                borderColor: '#F3F3F4',
            },
        },
        ITOContainer: {
            borderRadius: 10,
            width: '100%',
            background: 'linear-gradient(90deg, #FE686F 0%, #F78CA0 100%);',
            marginTop: theme.spacing(2.5),
        },
        ITOContent: {
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
            //TODO: https://github.com/mui-org/material-ui/issues/25011
            '&[disabled]': {
                opacity: 0.5,
            },
        },
    }),
)

interface BreakdownDialogUIProps extends withClasses<never> {
    open: boolean
    onClose?: () => void
    DialogProps?: Partial<DialogProps>
}

function BreakdownDialogUI(props: BreakdownDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    return (
        <InjectedDialog
            open={props.open}
            onClose={props.onClose}
            title="Your Mask Breakdown"
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogPaper }}>
            <DialogContent className={classes.content}>
                <MaskbookIcon classes={{ root: classes.logo }} />
                <Typography className={classes.amount}>200.00</Typography>
                <Box className={classes.balance}>
                    <span>Balance:</span>
                    <span>100</span>
                </Box>
                <Box className={classes.airDropContainer}>
                    <Box className={classes.airdropContent}>
                        <Box display="flex">
                            <Box>
                                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                                    Airdrop
                                    <InfoIcon fontSize="small" sx={{ marginLeft: 0.2 }} />
                                </Typography>
                                <Typography sx={{ marginTop: 1.5 }}>--</Typography>
                            </Box>
                            <AirdropIcon classes={{ root: classes.airDropIcon }} />
                        </Box>
                        <Box display="flex">
                            <Typography>Current ratio: 100%</Typography>
                            <Box display="flex" alignItems="center" marginLeft={2.5}>
                                <Button variant="contained" disabled className={classes.button}>
                                    Claim
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <Box className={classes.checkAddress}>
                        <Typography>Check your Address</Typography>
                        <Box sx={{ marginTop: 1.2, display: 'flex' }}>
                            <OutlinedInput classes={{ root: classes.checkAddressInput }} />
                            <Box marginLeft={2.5} paddingY={0.5}>
                                <Button variant="contained" className={classes.button}>
                                    Check
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box className={classes.ITOContainer}>
                    <Box className={classes.ITOContent}>
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
            </DialogContent>
        </InjectedDialog>
    )
}

export interface BreakdownDialogProps extends BreakdownDialogUIProps {}

export function BreakdownDialog(props: BreakdownDialogProps) {
    return <BreakdownDialogUI {...props} />
}
