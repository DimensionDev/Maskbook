import { useState } from 'react'
import {
    Alert,
    Button,
    createStyles,
    DialogActions,
    DialogContent,
    FormGroup,
    makeStyles,
    TextField,
    Tooltip,
} from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'

import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { WalletMessages } from '../messages'

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            padding: theme.spacing(2, 4.5),
        },
        group: {
            maxWidth: 450,
            margin: 'auto',
        },
        field: {
            marginTop: theme.spacing(3),
        },
        button: {
            margin: 'auto',
        },
    }),
)

type NetworkData = {
    name: string
    RPCUrl: string
    chainId: string
    currencySymbol?: string
    blockExplorerUrl?: string
}

export interface NetworkFormProps {
    data: NetworkData
    onChange?: (data: NetworkData) => void
}

// split Form for network edit
export function NetworkForm({ data, onChange }: NetworkFormProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        const newData = { ...data }
        switch (name) {
            case 'name':
                newData.name = value
                break
            case 'rpc_url':
                newData.RPCUrl = value
                break
            case 'chain_id':
                newData.chainId = value
                break
            case 'currency_symbol':
                newData.currencySymbol = value
                break
            case 'block_explorer_url':
                newData.blockExplorerUrl = value
                break
        }
        if (onChange) onChange(newData)
    }

    const isRPCUrlError = !!data.RPCUrl && !isValidURL(data.RPCUrl)
    const isBlockUrlError = !!data.blockExplorerUrl && !isValidURL(data.blockExplorerUrl)

    return (
        <FormGroup className={classes.group}>
            <Alert severity="warning" className={classes.field}>
                {t('plugin_wallet_add_network_warning')}
            </Alert>
            <TextField
                className={classes.field}
                required
                autoFocus
                name="name"
                label={t('plugin_wallet_add_network_name')}
                onChange={handleChange}
            />
            <TextField
                className={classes.field}
                required
                name="rpc_url"
                error={isRPCUrlError}
                label={t('plugin_wallet_add_network_rpc_url')}
                onChange={handleChange}
                helperText={isRPCUrlError ? t('plugin_wallet_add_network_url_invalid') : ' '}
            />
            <TextField
                className={classes.field}
                required
                name="chain_id"
                label={t('plugin_wallet_add_network_chain_id')}
                onChange={handleChange}
                InputProps={{
                    endAdornment: (
                        <Tooltip title={t('plugin_wallet_add_network_chain_id_info')}>
                            <InfoIcon />
                        </Tooltip>
                    ),
                }}
            />
            <TextField
                className={classes.field}
                name="currency_symbol"
                label={t('plugin_wallet_add_network_currency_symbol')}
                onChange={handleChange}
            />
            <TextField
                className={classes.field}
                error={isBlockUrlError}
                name="block_explorer_url"
                label={t('plugin_wallet_add_network_block_explorer_url')}
                onChange={handleChange}
                helperText={isBlockUrlError ? t('plugin_wallet_add_network_url_invalid') : ' '}
            />
        </FormGroup>
    )
}

export interface AddNetworkDialogProps {}

export function AddNetworkDialog(props: AddNetworkDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.addNetworkDialogUpdated, (ev) => {
        if (!ev.open) return
    })
    const onClose = () => setOpen({ open: false })
    //#endregion

    const onConfirm = () => {
        //
    }
    const [data, setData] = useState<NetworkData>({ name: '', RPCUrl: '', chainId: '' })
    const handleChange = (data: NetworkData) => {
        console.log(data)
        setData(data)
    }

    return (
        <InjectedDialog open={open} onClose={onClose} title={'Add Network'}>
            <DialogContent className={classes.content}>
                <NetworkForm data={data} onChange={handleChange} />
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    size="large"
                    variant="contained"
                    className={classes.button}
                    disabled={!isValidNetwork(data)}
                    onClick={onConfirm}>
                    {t('confirm')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}

export function isValidNetwork(data: NetworkData): boolean {
    return (
        !!data.name &&
        !!data.RPCUrl &&
        isValidURL(data.RPCUrl) &&
        !!data.chainId &&
        (!data.blockExplorerUrl || isValidURL(data.blockExplorerUrl))
    )
}

export function isValidURL(url: string | undefined): boolean {
    if (!url) return false
    return !!url.match(/https?:\/\//)
}
