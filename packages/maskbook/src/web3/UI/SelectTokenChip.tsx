import classNames from 'classnames'
import { Chip, ChipProps, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ErrorIcon from '@material-ui/icons/Error'
import { noop } from 'lodash-es'
import { TokenIcon } from '@masknet/shared'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => {
    return {
        chip: {
            border: 'none',
            borderRadius: 8,
            paddingLeft: theme.spacing(0.5),
        },
        loadingChip: {
            marginRight: theme.spacing(-0.5),
        },
        icon: {
            color: theme.palette.text.primary,
            pointerEvents: 'none',
        },
    }
})

export interface SelectTokenChipProps {
    token?: FungibleTokenDetailed | null
    error?: Error
    loading?: boolean
    readonly?: boolean
    ChipProps?: Partial<ChipProps>
}

export function SelectTokenChip(props: SelectTokenChipProps) {
    const { t } = useI18N()
    const { token, error, loading = false, readonly = false, ChipProps } = props
    const { classes } = useStyles()
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
                className={classes.chip}
                label={t('plugin_gitcoin_select_a_token')}
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
            icon={<TokenIcon address={token.address} name={token.name} logoURI={token.logoURI} />}
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
