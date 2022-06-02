import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { FungibleToken } from '@masknet/web3-shared-base'
import ErrorIcon from '@mui/icons-material/Error'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Chip, ChipProps, CircularProgress } from '@mui/material'
import classNames from 'classnames'
import { noop } from 'lodash-unified'
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
        tokenIcon: {
            width: 16,
            height: 16,
        },
    }
})

export interface SelectTokenChipProps {
    token?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null
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
                icon={<TokenIcon address={token.address} name={token.name} logoURI={token.logoURL} />}
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
                    logoURI={token.logoURL}
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
