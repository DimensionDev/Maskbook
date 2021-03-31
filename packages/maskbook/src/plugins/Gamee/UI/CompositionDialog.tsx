import { useCallback, useState } from 'react'
import {
    Box,
    createStyles,
    DialogContent,
    DialogProps,
    FormControl,
    InputLabel,
    makeStyles,
    MenuItem,
    Select,
    TextField,
} from '@material-ui/core'
import { pick } from 'lodash-es'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { CANDIDATE_TYPE, US_STATE_TYPE, GameeJSONPayload } from '../types'
import { getEnumAsArray } from '../../../utils/enum'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useChainId } from '../../../web3/hooks/useChainState'
import type { EthereumNetwork } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { resolveChainName } from '../../../web3/pipes'
import { useConstant } from '../../../web3/hooks/useConstant'
import { GameeMetaKey, GAMEE_CONSTANTS } from '../constants'
import { resolveStateName } from '../pipes'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePortalShadowRoot } from '@dimensiondev/maskbook-shared'
import { globalTypedMessageMetadata } from '../../../protocols/typed-message/global-state'

const useStyles = makeStyles((theme) =>
    createStyles({
        control: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
    }),
)

export interface CompositionDialogProps {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function CompositionDialog(props: CompositionDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const chainId = useChainId()

    // fetch the NTF token
    const TOKEN_ADDRESS = useConstant(GAMEE_CONSTANTS, 'TOKEN_ADDRESS')
    const { value: nftToken } = useERC721TokenDetailed(TOKEN_ADDRESS)

    // payload settings
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')
    const [state, setState] = useState(US_STATE_TYPE.AK)
    const [candidate, setCandidate] = useState(CANDIDATE_TYPE.TRUMP)

    const onConfirm = useCallback(() => {
        if (!nftToken) return

        // compose payload
        const payload: GameeJSONPayload = {
            state,
            winner: candidate,
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
        payload ? next.set(GameeMetaKey, payload) : next.delete(GameeMetaKey)
        ref.value = next

        // close the dialog
        props.onClose()
    }, [account, chainId, name, message, state, candidate, nftToken, props.onClose])

    return (
        <InjectedDialog open={props.open} title="Election Composition Dialog" onClose={props.onClose}>
            <DialogContent>
                <FormControl className={classes.control}>
                    <InputLabel>Winner</InputLabel>
                    {usePortalShadowRoot((container) => (
                        <Select
                            value={candidate}
                            MenuProps={{
                                container,
                            }}
                            onChange={(ev) => setCandidate(ev.target.value as CANDIDATE_TYPE)}>
                            {Object.values(getEnumAsArray(CANDIDATE_TYPE)).map((x) => (
                                <MenuItem key={x.value} value={x.value}>
                                    {x.key}
                                </MenuItem>
                            ))}
                        </Select>
                    ))}
                </FormControl>
                <FormControl className={classes.control}>
                    <InputLabel>State</InputLabel>
                    {usePortalShadowRoot((container) => (
                        <Select
                            value={state}
                            MenuProps={{
                                container,
                            }}
                            onChange={(ev) => setState(ev.target.value as US_STATE_TYPE)}>
                            {Object.values(getEnumAsArray(US_STATE_TYPE)).map((x) => (
                                <MenuItem key={x.value} value={x.value}>
                                    {resolveStateName(x.value)} ({x.value})
                                </MenuItem>
                            ))}
                        </Select>
                    ))}
                </FormControl>
                <FormControl className={classes.control}>
                    <TextField
                        label="Name (Optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                    />
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
                        <ActionButton disabled={!nftToken} variant="contained" onClick={onConfirm}>
                            {t('confirm')}
                        </ActionButton>
                    </Box>
                </FormControl>
            </DialogContent>
        </InjectedDialog>
    )
}
