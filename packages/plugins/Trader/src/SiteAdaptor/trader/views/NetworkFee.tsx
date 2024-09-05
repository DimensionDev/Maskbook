import { Icons } from '@masknet/icons'
import { makeStyles, MaskTextField, ShadowRootTooltip } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwap } from '../contexts/index.js'
import { Warning } from '../../components/Warning.js'

const useStyles = makeStyles<void, 'active'>()((theme, _, refs) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        gap: theme.spacing(1.5),
        padding: theme.spacing(2),
    },
    box: {
        borderRadius: theme.spacing(1.5),
        border: `1px solid ${theme.palette.maskColor.secondaryMain}`,
        cursor: 'pointer',
        [`&.${refs.active}`]: {
            border: `1px solid ${theme.palette.maskColor.main}`,
        },
    },
    option: {
        display: 'flex',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1.5),
    },
    active: {},
    boxTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    boxTail: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    estimatedTime: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    estimatedValue: {
        fontWeight: 400,
        fontSize: 13,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    boxSubtitle: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    boxMain: {
        marginRight: 'auto',
    },
    boxContent: {
        fontSize: 13,
        fontWeight: 400,
        padding: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        lineHeight: '18px',
        borderTop: `1px solid ${theme.palette.maskColor.line}`,
    },
    infoRow: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        justifyContent: 'space-between',
    },
    rowName: {
        fontSize: 14,
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
        flexGrow: 1,
        marginRight: 'auto',
    },
    rowValue: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
    },
}))

export const NetworkFee = memo(function NetworkFee() {
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const { networkFee, setNetworkFee } = useSwap()
    const [pendingNetworkFee, setPendingNetworkFee] = useState(networkFee)
    const [selectedOption, setSelectedOption] = useState('standard')
    const customBoxRef = useRef<HTMLDivElement>(null)

    const options = [
        { type: 'slow', label: 'Slow' },
        { type: 'average', label: 'Average' },
        { type: 'fast', label: 'Fast' },
    ]

    return (
        <div className={classes.container}>
            <div
                className={cx(classes.box, classes.option, selectedOption === 'slow' ? classes.active : null)}
                onClick={() => {
                    setSelectedOption('slow')
                    setPendingNetworkFee('slow')
                }}>
                <Icons.Bike size={30} />
                <div className={classes.boxMain}>
                    <Typography className={classes.boxTitle} variant="h2">
                        Slot
                    </Typography>
                    <Typography className={classes.boxSubtitle} variant="h3">
                        30.01Gwei
                    </Typography>
                </div>
                <div className={classes.boxTail}>
                    <Typography className={classes.estimatedTime}>1min</Typography>
                    <Typography className={classes.estimatedValue} variant="subtitle1">
                        0.0064603 MATIC≈ $0.004434
                    </Typography>
                </div>
            </div>
            <div
                className={cx(classes.box, classes.option, selectedOption === 'average' ? classes.active : null)}
                onClick={() => {
                    setSelectedOption('average')
                    setPendingNetworkFee('saverage')
                }}>
                <Icons.Car size={30} />
                <div className={classes.boxMain}>
                    <Typography className={classes.boxTitle} variant="h2">
                        Slot
                    </Typography>
                    <Typography className={classes.boxSubtitle} variant="h3">
                        30.01Gwei
                    </Typography>
                </div>
                <div className={classes.boxTail}>
                    <Typography className={classes.estimatedTime}>30secs</Typography>
                    <Typography className={classes.estimatedValue} variant="subtitle1">
                        0.0064603 MATIC≈ $0.004434
                    </Typography>
                </div>
            </div>
            <div
                className={cx(classes.box, classes.option, selectedOption === 'fast' ? classes.active : null)}
                onClick={() => {
                    setSelectedOption('fast')
                    setPendingNetworkFee('fast')
                }}>
                <Icons.Rocket size={30} />
                <div className={classes.boxMain}>
                    <Typography className={classes.boxTitle} variant="h2">
                        Slot
                    </Typography>
                    <Typography className={classes.boxSubtitle} variant="h3">
                        30.01Gwei
                    </Typography>
                </div>
                <div className={classes.boxTail}>
                    <Typography className={classes.estimatedTime}>10s</Typography>
                    <Typography className={classes.estimatedValue} variant="subtitle1">
                        0.0064603 MATIC≈ $0.004434
                    </Typography>
                </div>
            </div>
            <div className={cx(classes.box, selectedOption === 'custom' ? classes.active : null)} ref={customBoxRef}>
                <div
                    className={classes.option}
                    onClick={async () => {
                        setSelectedOption('custom')
                        setPendingNetworkFee('custom')
                        Promise.resolve().then(() => {
                            customBoxRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                            })
                        })
                    }}>
                    <Icons.Gear size={30} />
                    <div className={classes.boxMain}>
                        <Typography className={classes.boxTitle} variant="h2">
                            Custom
                        </Typography>
                        <Typography className={classes.boxSubtitle} variant="h3">
                            30.01Gwei
                        </Typography>
                    </div>
                    <div className={classes.boxTail}>
                        <Typography className={classes.estimatedTime}>1</Typography>
                        <Typography className={classes.estimatedValue} variant="subtitle1">
                            0.0064603 MATIC≈ $0.004434
                        </Typography>
                    </div>
                </div>
                {selectedOption === 'custom' ?
                    <div className={classes.boxContent}>
                        <Box display="flex" alignItems="center">
                            <Typography>Max base fee</Typography>
                            <Typography>Base fee required: 0.01 Gwei</Typography>
                        </Box>
                        <MaskTextField
                            placeholder="0.1-50"
                            type="number"
                            onChange={(e) => {}}
                            InputProps={{
                                endAdornment: <Typography>Gwei</Typography>,
                            }}
                        />
                        <Typography>Priority fee</Typography>
                        <MaskTextField
                            placeholder="0.1-50"
                            type="number"
                            onChange={(e) => {}}
                            InputProps={{
                                endAdornment: <Typography>Gwei</Typography>,
                            }}
                        />
                        <Typography>Gas Limit</Typography>
                        <MaskTextField placeholder="0.1-50" type="number" onChange={(e) => {}} />
                        <Warning description="The custom amount entered may be higher than the required network fee." />
                        <Button variant="roundedContained" fullWidth>
                            Confirm
                        </Button>
                    </div>
                :   null}
            </div>
            <div className={classes.infoRow}>
                <Typography className={classes.rowName}>
                    Estimated confirmation time
                    <ShadowRootTooltip title="Estimated time for the transaction to be confirmed on the blockchain">
                        <Icons.Questions size={16} />
                    </ShadowRootTooltip>
                </Typography>
                <Typography className={classes.rowValue}>
                    {selectedOption === 'slow' ?
                        '> 10 min'
                    : selectedOption === 'standard' ?
                        '5-10 min'
                    :   '< 5 min'}
                </Typography>
            </div>
        </div>
    )
})
