import { useCallback, CSSProperties } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { ChevronDown } from 'react-feather'
import type { EthereumTokenDetailedType, EthereumTokenType } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'

import { useI18N } from '../../../../utils'

const useStyles = makeStyles()(() => ({
    button: {
        width: '100%',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        padding: 0,
        border: 0,
    },
    textField: {
        width: '100%',
    },
    icon: {
        width: '20px',
        height: '20px',
    },
}))

interface TokenSelectField {
    label: string
    token?: EthereumTokenDetailedType<EthereumTokenType.Native | EthereumTokenType.ERC20>
    disabled?: boolean
    style?: CSSProperties
    onClick: () => void
}

export function TokenSelectField({ label, token, disabled, style, onClick }: TokenSelectField) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const handleClick = useCallback(() => {
        if (!disabled) {
            return onClick()
        }
    }, [disabled])

    return (
        <button onClick={handleClick} className={classes.button} style={style}>
            <TextField
                label={label}
                value={token?.symbol ?? ''}
                variant="standard"
                placeholder={t('plugin_referral_select_a_token')}
                className={classes.textField}
                disabled={disabled}
                InputProps={{
                    readOnly: true,
                    disableUnderline: true,

                    startAdornment: token && (
                        <InputAdornment position="start">
                            <TokenIcon {...token} classes={classes} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="start">
                            <ChevronDown />
                        </InputAdornment>
                    ),
                }}
                InputLabelProps={{ shrink: true }}
            />
        </button>
    )
}
