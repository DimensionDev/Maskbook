import classNames from 'classnames'
import { Chip, ChipProps, CircularProgress } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ErrorIcon from '@mui/icons-material/Error'
import { noop } from 'lodash-unified'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { useSharedI18N } from '../../../locales'
import { TokenIcon } from '../TokenIcon'

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
    token?: FungibleTokenDetailed | null
    error?: Error
    loading?: boolean
    readonly?: boolean
    ChipProps?: Partial<ChipProps>
}

// todo: merge into one with SelectTokenChip
export function SelectTokenChip(props: SelectTokenChipProps) {
    const t = useSharedI18N()
    const { token, error, loading = false, readonly = false, ChipProps } = props
    const classes = useStylesExtends(useStyles(), props)
    if (loading)
        return (
            <Chip
                className={classNames(classes.chip, classes.loadingChip)}
                icon={<CircularProgress size={16} />}
                size="small"
                clickable={false}
                variant="outlined"
            />
        )
    if (!token)
        return (
            <Chip
                className={classNames(classes.chip, classes.noToken)}
                label={t.select_token()}
                size="small"
                clickable={!readonly}
                {...ChipProps}
            />
        )

    if (token && error)
        return (
            <Chip
                className={classes.chip}
                icon={<TokenIcon address={token.address} name={token.name} logoURI={token.logoURI} />}
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
                    classes={{ icon: classes.tokenIcon }}
                    address={token.address}
                    name={token.name}
                    logoURI={token.logoURI}
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
