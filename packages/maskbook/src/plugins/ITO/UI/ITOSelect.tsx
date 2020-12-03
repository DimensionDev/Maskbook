import { useState, useCallback } from 'react'
import {
    makeStyles,
    createStyles,
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps,
    InputProps,
} from '@material-ui/core'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
        },

        input: {},
        iconButton: {},
    }),
)

export interface ITOSelectUIProps {
    label?: string
    onclick: () => void
    value: string
    icon?: React.ReactNode
    textFieldProps: Partial<TextFieldProps>
    inputProps: Partial<InputProps>
}

export function ITOSelectUI(props: ITOSelectUIProps) {
    const classes = useStyles()

    return (
        <>
            <TextField
                className={classes.input}
                value={props.value}
                label={props.label}
                fullWidth
                required
                InputProps={{
                    inputProps: {},
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={props.onClick}>
                                <ExpandMoreIcon fontSize="large" />
                            </IconButton>
                        </InputAdornment>
                    ),
                    startAdornment: <InputAdornment position="end">{props.icon}</InputAdornment>,
                    ...props.inputProps,
                }}
                {...props.textFieldProps}
            />
        </>
    )
}

export interface ITOTokenSelectProps extends ITOSelectUIProps {
    title: string
    token?: EtherTokenDetailed | ERC20TokenDetailed
    onTokenChange: (token?: EtherTokenDetailed | ERC20TokenDetailed) => void
}

export function ITOTokenSelect(props: ITOTokenSelectProps) {
    const [openSelectERC20TokenDialog, setOpenSelectERC20TokenDialog] = useState(false)

    const { token, onTokenChange } = props
    const onTokenChipClick = useCallback(() => {
        setOpenSelectERC20TokenDialog(true)
    }, [])
    const onSelectERC20TokenDialogClose = useCallback(() => {
        setOpenSelectERC20TokenDialog(false)
    }, [])
    const onSelectERC20TokenDialogSubmit = useCallback(
        (token: EtherTokenDetailed | ERC20TokenDetailed) => {
            onTokenChange(token)
            onSelectERC20TokenDialogClose()
        },
        [onSelectERC20TokenDialogClose],
    )
    return (
        <>
            <ITOSelectUI
                label={props.title}
                value={token?.symbol ?? ''}
                icon={token ? <TokenIcon address={token.address} name={token.name} /> : null}
                onClick={onTokenChipClick}
                inputProps={{}}
                textFieldProps={{}}
                {...props}
            />
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={token ? [props.token.address] : []}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}
