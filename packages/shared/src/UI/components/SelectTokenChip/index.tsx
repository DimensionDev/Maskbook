import { noop } from 'lodash-es'
import { Chip, type ChipProps } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { ExpandMore as ExpandMoreIcon, Error as ErrorIcon } from '@mui/icons-material'
import { TokenIcon } from '../TokenIcon/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        chip: {
            border: 'none',
            borderRadius: 8,
            paddingLeft: theme.spacing(0.5),
            fontSize: 12,
        },
        loadingChip: {
            marginRight: theme.spacing(-0.5),
            fontSize: 12,
        },
        icon: {
            color: theme.palette.text.primary,
            pointerEvents: 'none',
        },
        tokenIcon: {
            width: 16,
            height: 16,
        },
        noToken: {},
    }
})

export interface SelectTokenChipProps extends withClasses<'chip' | 'tokenIcon' | 'noToken'> {
    token?: Web3Helper.FungibleTokenAll | null
    error?: Error
    loading?: boolean
    readonly?: boolean
    ChipProps?: Partial<ChipProps>
    chainId?: Web3Helper.ChainIdAll
}

// todo: merge into one with SelectTokenChip
export function SelectTokenChip(props: SelectTokenChipProps) {
    const { token, error, loading = false, readonly = false, ChipProps, chainId } = props
    const { classes, cx } = useStyles(undefined, { props })
    if (loading)
        return (
            <Chip
                className={cx(classes.chip, classes.loadingChip)}
                icon={<LoadingBase size={16} />}
                size="small"
                clickable={false}
                variant="outlined"
            />
        )
    if (!token)
        return (
            <Chip
                className={cx(classes.chip, classes.noToken)}
                label={<Trans>Select</Trans>}
                size="small"
                clickable={!readonly}
                {...ChipProps}
            />
        )

    if (token && error)
        return (
            <Chip
                className={classes.chip}
                icon={<TokenIcon address={token.address} name={token.name} logoURL={token.logoURL} />}
                deleteIcon={<ErrorIcon className={classes.icon} />}
                label={token.symbol}
                color="default"
                size="small"
                variant="outlined"
                clickable={!readonly}
                // the delete icon only visible when this callback provided
                onDelete={noop}
                {...ChipProps}
            />
        )
    return (
        <Chip
            className={classes.chip}
            icon={
                <TokenIcon
                    className={classes.tokenIcon}
                    address={token.address}
                    name={token.name}
                    logoURL={token.logoURL}
                    chainId={chainId}
                />
            }
            deleteIcon={readonly ? undefined : <ExpandMoreIcon className={classes.icon} />}
            color="default"
            size="small"
            variant="outlined"
            clickable={!readonly}
            label={token.symbol}
            // the delete icon only visible when this callback provided
            onDelete={readonly ? undefined : noop}
            {...ChipProps}
        />
    )
}
