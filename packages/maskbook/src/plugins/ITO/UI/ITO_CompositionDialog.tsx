import { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { Button, DialogContent, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { getActivatedUI } from '../../../social-network/ui'
import { useChainId } from '../../../web3/hooks/useChainState'
import { resolveChainName } from '../../../web3/pipes'
import { EthereumNetwork, EthereumTokenType } from '../../../web3/types'
import { ITO_MetaKey } from '../constants'
import type { ITO_JSONPayload } from '../types'
import BigNumber from 'bignumber.js'

export interface ITO_CompositionDialogProps {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function ITO_CompositionDialog(props: ITO_CompositionDialogProps) {
    const chainId = useChainId()
    const onCreatePayload = useCallback(() => {
        // An ITO packet offering 1000000000 ETH for ordering 1000000000 * 500 MAK from public domain
        const payload: ITO_JSONPayload = {
            pid: uuid(),
            password: uuid(),
            total: new BigNumber('1000000000').toFixed(),
            sender: {
                address: '0x',
                name: 'Maskbook',
                message: 'This is my first ITO',
            },
            creation_time: new Date().getTime(),
            duration: 60 /* seconds */ * 60 /* mins */ * 24 /* hours */,
            network: resolveChainName(chainId) as EthereumNetwork,
            token_type: EthereumTokenType.Ether,
            exchange_ratios: ['1', '500'],
            exchange_tokens: [
                {
                    address: '0x',
                    name: 'MASKBOOK TEST TOKEN',
                    decimals: 18,
                    symbol: 'MAK',
                },
            ],
        }

        // update the composition dialog
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set(ITO_MetaKey, payload) : next.delete(ITO_MetaKey)
        ref.value = next

        // close the dialog
        props.onClose()
    }, [chainId, props.onClose])
    return (
        <InjectedDialog open={props.open} title="ITO Composition Dialog" onClose={props.onClose}>
            <DialogContent>
                <h1>Form</h1>
                <Button onClick={onCreatePayload}>Create a ITO payload</Button>
            </DialogContent>
        </InjectedDialog>
    )
}
