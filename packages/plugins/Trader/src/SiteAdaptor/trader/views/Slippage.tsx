import { Icons } from '@masknet/icons'
import { makeStyles, MaskTextField, ShadowRootTooltip } from '@masknet/theme'
import { alpha, Button, Switch, Typography } from '@mui/material'
import { memo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwap } from '../contexts/index.js'
import { isNumber } from 'lodash-es'

const useStyles = makeStyles<void, 'active'>()((theme, _, refs) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        gap: theme.spacing(1.5),
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        marginBottom: 'auto',
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        border: `1px solid ${theme.palette.maskColor.secondaryMain}`,
        cursor: 'pointer',
        [`&.${refs.active}`]: {
            border: `1px solid ${theme.palette.maskColor.main}`,
        },
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
    tag: {
        fontSize: 12,
        lineHeight: '16px',
        padding: theme.spacing(0.5),
        borderRadius: theme.spacing(0.5),
        backgroundColor: theme.palette.maskColor.bg,
        color: theme.palette.maskColor.main,
    },
    boxContent: {
        fontSize: 13,
        fontWeight: 400,
        padding: theme.spacing(0.5),
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    footer: {
        boxSizing: 'content-box',
        display: 'flex',
        gap: theme.spacing(1.5),
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 0px 20px rgba(255, 255, 255, 0.12)'
            :   '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        maxHeight: 40,
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

export const Slippage = memo(function Slippage() {
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const { isAutoSlippage, setIsAutoSlippage, setSlippage, slippage, mevProtection, setMevProtection, quote } =
        useSwap()
    const [pendingIsAutoSlippage, setPendingIsAutoSlippage] = useState(isAutoSlippage)
    const [pendingSlippage, setPendingSlippage] = useState(slippage)
    const [pendingMevProtection, setPendingMevProtection] = useState(mevProtection)

    const inputRef = useRef<HTMLInputElement>()

    return (
        <div className={classes.container}>
            <div className={classes.form}>
                <div
                    className={cx(classes.box, pendingIsAutoSlippage ? classes.active : null)}
                    onClick={() => {
                        setPendingIsAutoSlippage(true)
                    }}>
                    <Typography className={classes.boxTitle}>Auto (0.05%)</Typography>
                    <Typography className={classes.boxContent}>
                        Slippage is automatically adjusted based on the chosen token to increase the chance of a
                        successful transaction.
                    </Typography>
                </div>
                <div
                    className={cx(classes.box, !pendingIsAutoSlippage ? classes.active : null)}
                    onClick={async () => {
                        setPendingIsAutoSlippage(false)
                        inputRef.current?.focus()
                    }}>
                    <Typography className={classes.boxTitle}>
                        Custom
                        <Typography component="span" className={classes.tag}>
                            Single-Chain
                        </Typography>
                    </Typography>
                    <div className={classes.boxContent}>
                        <Typography mb={0.5}>
                            The transaction will be executed according to the slippage you set
                        </Typography>
                        <MaskTextField
                            placeholder="0.1-50"
                            type="number"
                            InputProps={{
                                inputProps: {
                                    min: 0.1,
                                    max: 50,
                                    ref: inputRef,
                                },
                            }}
                            value={pendingSlippage}
                            onChange={(e) => {
                                const raw = e.currentTarget.value
                                const value = raw ? Number.parseFloat(raw) : null
                                if (isNumber(value) && (value < 0 || value > 50)) return

                                setPendingSlippage(raw)
                            }}
                        />
                    </div>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.rowName}>
                        MEV protection
                        <ShadowRootTooltip
                            placement="top"
                            title="Text: An MEV attack is when attackers place an order at a lower price just moments before you buy an asset and sell it after your order is executed to earn the difference and make your buy price higher.
To prevent MEV attacks, you can turn on MEV protection in your OKX Wallet. This will send transactions to trustworthy third-party nodes, such as Flashbots, to ensure that the order of transactions doesn't change and your transactions are protected.
At the moment, MEV protection only supports the Ethereum network. Your decision to manually turn it on or off only applies to the current transaction. A new transaction will reset your MEV setting.">
                            <Icons.Questions size={16} />
                        </ShadowRootTooltip>
                    </Typography>
                    <Typography className={classes.rowValue}>
                        <Switch
                            checked={pendingMevProtection}
                            onChange={() => {
                                setPendingMevProtection((v) => !v)
                            }}
                        />
                    </Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.rowName}>Minimum received</Typography>
                    <Typography className={classes.rowValue}>
                        2.46
                        {quote?.toToken.tokenSymbol}
                    </Typography>
                </div>
            </div>
            <div className={classes.footer}>
                <Button
                    fullWidth
                    disabled={!pendingIsAutoSlippage && !pendingSlippage}
                    onClick={() => {
                        setIsAutoSlippage(pendingIsAutoSlippage)
                        setSlippage(pendingSlippage)
                        setMevProtection(pendingMevProtection)
                        navigate(-1)
                    }}>
                    Confirm
                </Button>
            </div>
        </div>
    )
})
