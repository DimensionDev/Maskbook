import { FormControl, ListItemIcon, MenuItem, Typography, InputBase, InputAdornment } from '@mui/material'
import { useI18N } from '../../../utils'
import { useEffect, useState, useCallback, useRef, useMemo, ChangeEvent } from 'react'
import { FormattedBalance, TokenIcon, useMenuConfig } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import Check from '@mui/icons-material/Check'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { FungibleToken, isSameAddress, formatBalance } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

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
    check: {
        flex: 1,
        display: 'flex',
        justifyContent: 'end',
        color: theme.palette.text.primary,
    },
    end: {
        paddingRight: 16,
    },
    arrow: {
        color: theme.palette.maskColor.second,
    },
}))

export interface SelectTokenPanelProps {
    amount: string
    balance: string
    token?: FungibleToken<ChainId, SchemaType>
    onAmountChange: (amount: string) => void
    onTokenChange: (token: FungibleToken<ChainId, SchemaType>) => void
    tokens?: Array<FungibleToken<ChainId, SchemaType>>
}

export function SelectTokenListPanel(props: SelectTokenPanelProps) {
    const { amount, balance, token, onAmountChange, onTokenChange, tokens = [] } = props

    const { t } = useI18N()
    const ref = useRef<HTMLElement>(null)
    const { classes } = useStyles()
    const [haveMenu, setHaveMenu] = useState(true)

    const width = useMemo(() => {
        if (!ref.current) return
        return window.getComputedStyle(ref.current).width
    }, [ref.current])

    useEffect(() => {
        if (tokens.length <= 1) setHaveMenu(false)
    }, [tokens])

    const [menu, openMenu] = useMenuConfig(
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
                            logoURL={x.logoURL}
                        />
                    </ListItemIcon>
                    <Typography variant="inherit">{x.symbol}</Typography>
                    <ListItemIcon className={classes.check}>
                        {isSameAddress(x.address, token?.address) ? <Check /> : null}
                    </ListItemIcon>
                </MenuItem>
            )
        }) ?? [],
        {
            anchorSibling: false,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
            },
            PaperProps: {
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
                    <span style={{ marginRight: 4 }}>{t('wallet_balance')}:</span>
                    <FormattedBalance
                        value={balance}
                        decimals={token?.decimals}
                        significant={6}
                        formatter={formatBalance}
                    />
                    <span style={{ marginLeft: 4 }}>{token?.symbol}</span>
                </Typography>
            </div>
            <FormControl fullWidth>
                <InputBase
                    fullWidth
                    value={amount}
                    ref={ref}
                    placeholder="0.0"
                    onChange={onChange}
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
                    }}
                    endAdornment={
                        <InputAdornment position="end" className={classes.end}>
                            {token?.address ? (
                                <>
                                    <TokenIcon
                                        classes={{ icon: classes.icon }}
                                        address={token?.address}
                                        name={token?.name}
                                        logoURL={token?.logoURL}
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
                            {haveMenu ? <Icons.ArrowDrop onClick={onClick} className={classes.arrow} /> : null}
                        </InputAdornment>
                    }
                />
                {menu}
            </FormControl>
        </div>
    )
}
