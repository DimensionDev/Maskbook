import { Box, Button, createStyles, makeStyles, OutlinedInput, Typography } from '@material-ui/core'
import { Info as InfoIcon } from '@material-ui/icons'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { AirdropIcon } from '../../../resources/AirdropIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            background: 'linear-gradient(90deg, #2174F6 0%, #00C6FB 100%)',
            borderRadius: 10,
            width: '100%',
        },
        content: {
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
        button: {
            background: 'rgba(255,255,255,.2)',
            //TODO: https://github.com/mui-org/material-ui/issues/25011
            '&[disabled]': {
                opacity: 0.5,
            },
        },
    }),
)

export interface AirdropCardProps extends withClasses<never> {}

export function AirdropCard(props: AirdropCardProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Box className={classes.root}>
            <Box className={classes.content}>
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
    )
}
