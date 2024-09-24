import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { CoinIcon, type CoinIconProps } from './CoinIcon.js'

const useStyles = makeStyles<void, 'active'>()((theme, _, refs) => ({
    active: {},
    node: {
        position: 'relative',
        padding: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        borderRadius: theme.spacing(1.5),
        border: `1px solid ${theme.palette.maskColor.line}`,
        backgroundColor: theme.palette.maskColor.bg,
        [`&.${refs.active}`]: {
            backgroundColor: theme.palette.maskColor.bottom,
            '&::after': {
                content: '""',
                display: 'block',
                borderRadius: 4,
                border: '1px solid transparent',
                borderRightColor: theme.palette.maskColor.line,
                borderBottomColor: theme.palette.maskColor.line,
                transform: 'scaleX(.6) rotate(45deg) translate(-50%, 100%)',
                backgroundColor: theme.palette.maskColor.bottom,
                position: 'absolute',
                width: 12,
                height: 12,
                left: '50%',
                bottom: -2,
                zIndex: 1,
            },
        },
    },
    coin: {
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'flex-start',
    },
    chainName: {
        fontSize: 16,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
    },
    symbol: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    step: {
        position: 'absolute',
        userSelect: 'none',
        right: 0,
        top: 0,
        minWidth: theme.spacing(4),
        textAlign: 'center',
        lineHeight: '76px',
        fontSize: 64,
        fontWeight: 700,
        fontFamily: 'Helvetica',
        color: theme.palette.maskColor.secondaryMain,
    },
}))

interface Props extends HTMLProps<HTMLDivElement>, Pick<CoinIconProps, 'chainId' | 'address' | 'disableBadge'> {
    symbol?: string
    step: number
    active?: boolean
}

export const BridgeNode = memo<Props>(function BridgeNode({
    symbol,
    chainId,
    address,
    label,
    step,
    active,
    disableBadge,
    ...rest
}) {
    const { classes, cx } = useStyles()
    return (
        <div {...rest} className={cx(classes.node, rest.className, active ? classes.active : null)}>
            <Typography className={classes.chainName}>{label}</Typography>
            <div className={classes.coin}>
                <CoinIcon chainId={chainId} address={address} disableBadge={disableBadge} />
                <Typography className={classes.symbol}>{symbol ?? '--'}</Typography>
            </div>
            <Typography className={classes.step}>{step}</Typography>
        </div>
    )
})
