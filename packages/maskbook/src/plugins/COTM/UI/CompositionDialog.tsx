import { useCallback, useState } from 'react'
import { Box, createStyles, DialogContent, DialogProps, FormControl, makeStyles, TextField } from '@material-ui/core'
import { pick } from 'lodash-es'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import type { COTM_JSONPayload } from '../types'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useChainId } from '../../../web3/hooks/useChainState'
import type { EthereumNetwork } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { resolveChainName } from '../../../web3/pipes'
import { useConstant } from '../../../web3/hooks/useConstant'
import { COTM_MetaKey, COTM_CONSTANTS } from '../constants'
import { activatedSocialNetworkUI } from '../../../social-network-next'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useI18N } from '../../../utils/i18n-next-ui'
import { globalTypedMessageMetadata } from '../../../protocols/typed-message/global-state'

const useStyles = makeStyles((theme) =>
    createStyles({
        control: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
    }),
)

export interface COTM_CompositionDialogProps {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function COTM_CompositionDialog(props: COTM_CompositionDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const chainId = useChainId()

    // fetch the NTF token
    const COTM_TOKEN_ADDRESS = useConstant(COTM_CONSTANTS, 'COTM_TOKEN_ADDRESS')
    const { value: nftToken } = useERC721TokenDetailed(COTM_TOKEN_ADDRESS)

    // payload settings
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')

    const onConfirm = useCallback(() => {
        if (!nftToken) return

        // compose payload
        const payload: COTM_JSONPayload = {
            sender: {
                address: account,
                name,
                message,
            },
            creation_time: new Date().getTime(),
            network: resolveChainName(chainId) as EthereumNetwork,
            ntf_token: pick(nftToken, ['address', 'name', 'symbol']),
        }

        // update the composition dialog
        const ref = globalTypedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set(COTM_MetaKey, payload) : next.delete(COTM_MetaKey)
        ref.value = next

        // close the dialog
        props.onClose()
    }, [account, chainId, name, message, nftToken, props.onClose])

    return (
        <InjectedDialog open={props.open} title="#CreativityOnTheMove Composition Dialog" onClose={props.onClose}>
            <DialogContent>
                <FormControl className={classes.control}>
                    <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} variant="outlined" />
                </FormControl>
                <FormControl className={classes.control}>
                    <TextField
                        label="Message (Optional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        variant="outlined"
                    />
                </FormControl>
                <FormControl className={classes.control}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}>
                        <ActionButton disabled={!nftToken || !name} variant="contained" onClick={onConfirm}>
                            {t('confirm')}
                        </ActionButton>
                    </Box>
                </FormControl>
            </DialogContent>
        </InjectedDialog>
    )
}
