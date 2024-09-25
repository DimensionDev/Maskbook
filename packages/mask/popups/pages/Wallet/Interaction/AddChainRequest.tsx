import { makeStyles } from '@masknet/theme'
import type { InteractionItemProps } from './interaction.js'
import { Typography } from '@mui/material'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { useTitle } from 'react-use'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyle = makeStyles()({
    title: { fontSize: 28, marginTop: 16 },
    origin: {
        border: '1px solid gray',
        textAlign: 'center',
        borderRadius: 10,
        fontSize: 'large',
        padding: '0.25em',
        margin: '1em 0.5em',
    },
})
export function AddChainRequest(props: InteractionItemProps) {
    const { _ } = useLingui()
    const { setConfirmAction } = props
    const { classes } = useStyle()
    const t = useMaskSharedTrans()
    const origin = props.currentRequest.origin

    useTitle(_(msg`Connect with Mask Wallet`))

    t.wallet_status_pending({ count: 1 })

    if (!origin) return null
    setConfirmAction(async () => {
        throw new Error('TODO')
        // await Message!.approveRequestWithResult(props.currentRequest.ID, { result: null, jsonrpc: '2.0', id: 0 })
    })

    // TODO: Inform users that their on-chain activity and IP address will be exposed to RPC endpoints.
    // TODO: If an endpoint is unknown to the wallet, inform users that the endpoint may behave in unexpected ways.
    // TODO: Ensure that any chain metadata, such as nativeCurrency and blockExplorerUrls, are validated and used to maximum effect in the UI.
    // TODO: If any images are provided via iconUrls, ensure that the user understands that the icons could misrepresent the actual chain added.
    // TODO: If the wallet UI has a concept of a “currently selected” or “currently active” chain, ensure that the user understands when a chain added using wallet_addEthereumChain becomes selected.
    return (
        <>
            <Typography variant="h1" className={classes.title}>
                Add Network
            </Typography>
            <Typography variant="h2" className={classes.origin}>
                {origin.startsWith('https://') ? origin.slice('https://'.length) : origin}
            </Typography>
        </>
    )
}
