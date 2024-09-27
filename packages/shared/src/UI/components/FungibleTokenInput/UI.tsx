import { memo } from 'react'
import {
    Typography,
    InputBase,
    Box,
    Chip,
    lighten,
    inputBaseClasses,
    chipClasses,
    type InputBaseProps,
    alpha,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatBalance } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
import { FormattedBalance, NetworkIcon, TokenIcon } from '../../../index.js'
import { useNetworkContext, useNetworks } from '@masknet/web3-hooks-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        height: 66,
        padding: theme.spacing(1.25, 1.5),
        [`& > .${inputBaseClasses.input}`]: {
            paddingTop: `${theme.spacing(2.75)}!important`,
            paddingBottom: '0px !important',
            flex: 2,
            paddingLeft: '0px !important',
            fontSize: 14,
            fontWeight: 400,
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
        width: 20,
        height: 20,
        marginRight: '0px !important',
    },
    badgeIcon: {
        width: 10,
        height: 10,
        position: 'absolute',
        right: -3,
        bottom: -3,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
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
        color: theme.palette.maskColor.white,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 18,
        padding: '0 3px',
        borderRadius: 4,
        fontSize: 10,
        marginLeft: 4,
        fontWeight: 700,
        lineHeight: '18px',
        cursor: 'pointer',
        background: theme.palette.maskColor.primary,
        '&:hover': {
            background: alpha(theme.palette.maskColor.primary, 0.8),
        },
        [`& > .${chipClasses.label}`]: {
            padding: 0,
        },
    },
    balance: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        fontWeight: 700,
        marginLeft: 4,
    },
    arrowIcon: {
        color: `${theme.palette.maskColor.second}!important`,
    },
    chipLabel: {
        maxWidth: 150,
    },
}))

export interface FungibleTokenInputUIProps extends InputBaseProps {
    label: React.ReactNode
    disableMax?: boolean
    isNative?: boolean
    token?: Web3Helper.FungibleTokenAll | null
    onSelectToken?: () => void
    onMaxClick: () => void
    balance: string
    loadingBalance?: boolean
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
        loadingBalance,
        disableMax = false,
        disableToken = false,
        disableBalance = false,
        ...props
    }) => {
        const { classes, cx } = useStyles()
        const { pluginID } = useNetworkContext()
        const networks = useNetworks(pluginID)
        const network = networks.find((x) => x.chainId === token?.chainId)
        return (
            <InputBase
                fullWidth
                startAdornment={<Typography className={cx(classes.label, classes.title)}>{label}</Typography>}
                endAdornment={
                    <Box className={classes.control} justifyContent={disableBalance ? 'flex-end' : undefined}>
                        <Typography className={classes.label} display="flex" alignItems="center" component="div">
                            {!disableBalance ?
                                <>
                                    {isNative ?
                                        <Trans>Available Balance</Trans>
                                    :   <Trans>Balance</Trans>}
                                    :
                                    <Typography className={classes.balance} component="span">
                                        {token && !loadingBalance ?
                                            <FormattedBalance
                                                value={balance}
                                                decimals={token.decimals}
                                                significant={token.decimals}
                                                formatter={formatBalance}
                                            />
                                        :   '--'}
                                    </Typography>
                                </>
                            :   null}
                            {!disableMax ?
                                <Chip className={classes.maxChip} label="MAX" size="small" onClick={onMaxClick} />
                            :   null}
                        </Typography>
                        {!disableToken ?
                            <Box display="flex" alignItems="center" columnGap="12px">
                                {token ?
                                    <Chip
                                        size="small"
                                        onClick={onSelectToken}
                                        className={classes.chip}
                                        classes={{ label: classes.chipLabel }}
                                        icon={
                                            <Box position="relative">
                                                <TokenIcon
                                                    className={classes.tokenIcon}
                                                    address={token.address}
                                                    name={token.name}
                                                    chainId={token.chainId}
                                                    logoURL={token.logoURL}
                                                />
                                                <NetworkIcon
                                                    pluginID={pluginID}
                                                    className={classes.badgeIcon}
                                                    chainId={token.chainId}
                                                    size={16}
                                                    network={network}
                                                />
                                            </Box>
                                        }
                                        deleteIcon={<Icons.ArrowDrop className={classes.arrowIcon} size={24} />}
                                        onDelete={onSelectToken}
                                        label={token.symbol}
                                    />
                                :   <Box className={classes.selectToken} onClick={onSelectToken}>
                                        <Trans>Select a token</Trans>
                                        <Icons.ArrowDrop size={16} />
                                    </Box>
                                }
                            </Box>
                        :   null}
                    </Box>
                }
                {...props}
                onChange={(ev) => {
                    if (ev.currentTarget.value && !new RegExp(props.inputProps?.pattern).test(ev.currentTarget.value)) {
                        return
                    }
                    props.onChange?.(ev)
                }}
                className={cx(classes.root, props.className)}
            />
        )
    },
)
FungibleTokenInputUI.displayName = 'FungibleTokenInputUI'
