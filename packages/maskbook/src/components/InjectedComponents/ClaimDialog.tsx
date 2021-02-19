import { InjectedDialog } from '../shared/InjectedDialog'
import {
    DialogContent,
    Box,
    Theme,
    makeStyles,
    createStyles,
    DialogActions,
    Button,
    DialogProps,
} from '@material-ui/core'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { useStylesExtends } from '../custom-ui-helper'
import { SliderIcon } from '../../resources/SliderIcon'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            padding: theme.spacing(5, 5, 10),
        },
        logo: {
            width: 36,
            height: 36,
            marginRight: theme.spacing(2.5),
        },
        count: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            color: theme.palette.common.black,
        },
        gasFee: {
            marginTop: theme.spacing(3.75),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 14,
            color: theme.palette.text.secondary,
        },
        sliderIcon: {
            width: 20,
            height: 20,
            marginLeft: theme.spacing(0.5),
        },
    }),
)

interface ClaimDialogUIProps extends withClasses<never> {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

function ClaimDialogUI(props: ClaimDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <InjectedDialog open={props.open} onClose={props.onClose} title="Claim">
            <DialogContent className={classes.content}>
                <Box className={classes.count}>
                    <Box display="flex" alignItems="center">
                        <MaskbookIcon classes={{ root: classes.logo }} />
                        <Box>Mask</Box>
                    </Box>
                    <Box>50.00</Box>
                </Box>
                <Box className={classes.gasFee}>
                    <Box>Gas Fee</Box>
                    <Box display="flex" alignItems="center">
                        0.0012 ETH ≈ $30.0
                        <SliderIcon classes={{ root: classes.sliderIcon }} />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" sx={{ width: '100%' }}>
                    Claim 50.00 Mask
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}

export interface ClaimDialogProps extends ClaimDialogUIProps {}

export function ClaimDialog(props: ClaimDialogProps) {
    return <ClaimDialogUI {...props} />
}
