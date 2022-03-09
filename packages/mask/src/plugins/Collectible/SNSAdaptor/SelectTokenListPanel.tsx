import { formatBalance, FungibleTokenDetailed, isSameAddress } from '@masknet/web3-shared-evm'
import { FormControl, InputAdornment, ListItemIcon, MenuItem, OutlinedInput, Typography } from '@mui/material'
import { useI18N, useMenu } from '../../../utils'
import { useEffect, useState, useCallback, useRef, useMemo, ChangeEvent } from 'react'
import { FormattedBalance, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Check from '@mui/icons-material/Check'

export interface SelectTokenPanelProps {
    amount: string
    balance: string
    token?: FungibleTokenDetailed
    onAmountChange: (amount: string) => void
    onTokenChange: (token: FungibleTokenDetailed) => void
    tokens?: FungibleTokenDetailed[]
}

const MIN_AMOUNT_LENGTH = 1
const MAX_AMOUNT_LENGTH = 79

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'block',
    },
    title: {
        display: 'flex',
        justifyContent: 'space-between',
        flex: 1,
    },
    icon: {
        width: 24,
        height: 24,
    },
    input: {},

    check: {
        flex: 1,
        display: 'flex',
        justifyContent: 'end',
        color: theme.palette.text.primary,
    },
}))
export function SelectTokenListPanel(props: SelectTokenPanelProps) {
    const { t } = useI18N()
    const { amount, balance, token, onAmountChange, onTokenChange, tokens = [] } = props
    const ref = useRef<HTMLElement>(null)

    const { classes } = useStyles()

    const [haveMenu, setHaveMenu] = useState(true)

    const width = useMemo(() => {
        if (!ref.current) return
        const style = window.getComputedStyle(ref.current)
        return style.width
    }, [ref.current])

    useEffect(() => {
        if (tokens.length <= 1) setHaveMenu(false)
    }, [tokens])

    const [menu, openMenu] = useMenu(
        tokens.map((x, i) => {
            return (
                <MenuItem
                    key={i}
                    onClick={() => {
                        onTokenChange(x)
                    }}>
                    <ListItemIcon>
                        <TokenIcon
                            classes={{ icon: classes.icon }}
                            address={x.address}
                            name={x.name}
                            logoURI={x.logoURI}
                        />
                    </ListItemIcon>
                    <Typography variant="inherit">{x.symbol}</Typography>
                    <ListItemIcon className={classes.check}>
                        {isSameAddress(x.address, token?.address) ? <Check /> : null}
                    </ListItemIcon>
                </MenuItem>
            )
        }) ?? [],
        false,
        {
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
            },
            paperProps: {
                style: { width },
            },
        },
    )

    const onClick = useCallback(() => {
        if (!ref.current) return
        openMenu(ref.current)
    }, [openMenu, ref.current])

    // #region update amount by self
    const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals}}$`), // .ddd...d
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
        }),
        [token?.decimals],
    )
    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const amount_ = ev.currentTarget.value.replace(/,/g, '.')
            if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) onAmountChange(`0${amount_}`)
            else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) onAmountChange(amount_)
        },
        [onAmountChange, RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT],
    )
    // #endregion

    return (
        <div className={classes.root}>
            <div className={classes.title}>
                <Typography variant="body1" color="colorPrimary">
                    {t('plugin_collectible_price')}
                </Typography>
                <Typography variant="body1" color="colorPrimary">
                    {t('wallet_balance')}:
                    <FormattedBalance
                        value={balance}
                        decimals={token?.decimals}
                        significant={6}
                        formatter={formatBalance}
                    />
                    {token?.symbol}
                </Typography>
            </div>
            <FormControl className={classes.input} variant="outlined" fullWidth>
                <OutlinedInput
                    fullWidth
                    required
                    type="text"
                    value={amount}
                    ref={ref}
                    placeholder="0.0"
                    inputProps={{
                        autoComplete: 'off',
                        autoCorrect: 'off',
                        title: 'Token Amount',
                        inputMode: 'decimal',
                        min: 0,
                        minLength: MIN_AMOUNT_LENGTH,
                        maxLength: MAX_AMOUNT_LENGTH,
                        pattern: /^\d+[,.]?\d+$/,
                        spellCheck: false,
                        className: classes.input,
                    }}
                    onChange={onChange}
                    endAdornment={
                        <InputAdornment position="end">
                            {token?.address ? (
                                <>
                                    <TokenIcon
                                        classes={{ icon: classes.icon }}
                                        address={token?.address}
                                        name={token?.name}
                                        logoURI={token?.logoURI}
                                    />
                                    <Typography
                                        variant="inherit"
                                        sx={{
                                            paddingLeft: (theme) => theme.spacing(0.5),
                                        }}>
                                        {token?.symbol}
                                    </Typography>
                                </>
                            ) : null}
                            {haveMenu ? <ArrowDropDownIcon onClick={onClick} /> : null}
                        </InputAdornment>
                    }
                />
                {menu}
            </FormControl>
        </div>
    )
}
