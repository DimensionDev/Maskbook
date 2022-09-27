import { memo } from 'react'
import {
    Typography,
    InputBase,
    Box,
    Chip,
    lighten,
    inputBaseClasses,
    alpha,
    chipClasses,
    InputBaseProps,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatBalance, FungibleToken } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
import { noop } from 'lodash-unified'
import { FormattedBalance, TokenIcon, useSharedI18N } from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        height: 66,
        padding: theme.spacing(1.25, 1.5),
        [`& > .${inputBaseClasses.input}`]: {
            paddingTop: `${theme.spacing(2.75)}!important`,
            flex: 2,
            paddingLeft: '0px !important',
        },
    },
    title: {
        position: 'absolute',
        top: 10,
        left: 12,
    },
    label: {
        fontSize: 13,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        whiteSpace: 'nowrap',
    },
    control: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        rowGap: 4,
        flex: 1,
    },
    chip: {
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    tokenIcon: {
        width: 24,
        height: 24,
    },
    selectToken: {
        backgroundColor: theme.palette.maskColor.primary,
        color: theme.palette.maskColor.white,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
        padding: theme.spacing(0.5, 1),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 99,
        cursor: 'pointer',
        ['&:hover']: {
            backgroundColor: lighten(theme.palette.maskColor.primary, 0.1),
        },
    },
    maxChip: {
        backgroundColor: alpha(theme.palette.maskColor.primary, 0.1),
        color: theme.palette.maskColor.primary,
        borderRadius: 4,
        fontSize: 14,
        lineHeight: '18px',
        padding: '3px 12px',
        cursor: 'pointer',

        [`& > .${chipClasses.label}`]: {
            padding: 0,
        },
    },
    balance: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        fontWeight: 700,
        marginLeft: 4,
    },
    arrowIcon: {
        color: `${theme.palette.maskColor.second}!important`,
    },
}))

interface FungibleTokenInputUIProps extends InputBaseProps {
    label: string
    disableMax?: boolean
    isNative?: boolean
    token?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null
    onSelectToken?: () => void
    onMaxClick: () => void
    balance: string
    loadingBalance?: boolean
    maxAmountSignificant?: number
    disableBalance?: boolean
    disableToken?: boolean
}

export const FungibleTokenInputUI = memo<FungibleTokenInputUIProps>(
    ({
        label,
        isNative,
        token,
        onSelectToken,
        onMaxClick,
        balance,
        maxAmountSignificant = 4,
        loadingBalance,
        disableMax = false,
        disableToken = false,
        disableBalance = false,
        ...props
    }) => {
        const { classes, cx } = useStyles()
        const t = useSharedI18N()
        return (
            <InputBase
                fullWidth
                startAdornment={<Typography className={cx(classes.label, classes.title)}>{label}</Typography>}
                endAdornment={
                    <Box className={classes.control} justifyContent={disableBalance ? 'flex-end' : undefined}>
                        {!disableBalance ? (
                            <Typography className={classes.label} display="flex" alignItems="center">
                                {isNative ? t.available_balance() : t.balance()}:
                                <Typography className={classes.balance} component="span">
                                    {token && !loadingBalance ? (
                                        <FormattedBalance
                                            value={balance}
                                            decimals={token?.decimals}
                                            significant={maxAmountSignificant}
                                            formatter={formatBalance}
                                        />
                                    ) : (
                                        '--'
                                    )}
                                </Typography>
                            </Typography>
                        ) : null}
                        {!disableToken ? (
                            <Box display="flex" alignItems="center" columnGap="12px">
                                {token ? (
                                    <>
                                        {!disableMax ? (
                                            <Chip
                                                className={classes.maxChip}
                                                label="MAX"
                                                size="small"
                                                onClick={onMaxClick}
                                            />
                                        ) : null}
                                        <Chip
                                            size="small"
                                            onClick={onSelectToken}
                                            className={classes.chip}
                                            icon={
                                                <TokenIcon
                                                    classes={{ icon: classes.tokenIcon }}
                                                    address={token.address}
                                                    name={token.name}
                                                    chainId={token.chainId}
                                                    logoURL={token.logoURL}
                                                />
                                            }
                                            deleteIcon={<Icons.ArrowDrop className={classes.arrowIcon} size={24} />}
                                            onDelete={noop}
                                            label={token.symbol}
                                        />
                                    </>
                                ) : (
                                    <Box className={classes.selectToken} onClick={onSelectToken}>
                                        {t.select_a_token()}
                                        <Icons.ArrowDrop size={16} />
                                    </Box>
                                )}
                            </Box>
                        ) : null}
                    </Box>
                }
                className={classes.root}
                {...props}
            />
        )
    },
)
