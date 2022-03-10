import { Currency } from '@masknet/icons'
import { usePostInfoDetails } from '@masknet/plugin-infra'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import classnames from 'classnames'
import { FC, HTMLProps, MouseEventHandler, useCallback, useMemo } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import Services from '../../../../extension/service'
import { PluginNextIdMessages } from '../../messages'
import { Platform } from '../../types'

interface Props extends HTMLProps<HTMLDivElement> {
    addresses?: string[]
    receiver?: ProfileIdentifier
}

const useStyles = makeStyles()({
    tipButton: {
        cursor: 'pointer',
    },
    postTipButton: {
        display: 'flex',
        // temporarily hard code
        height: 46,
        alignItems: 'center',
    },
})

export const TipButton: FC<Props> = ({ className, receiver, addresses = [], children, ...rest }) => {
    const { classes } = useStyles()

    const [walletsState, queryBindings] = useAsyncFn(async () => {
        if (!receiver) return []

        const persona = await Services.Identity.queryPersonaByProfile(receiver)
        if (!persona) return []

        const bindings = await Services.Helper.queryExistedBinding(persona.identifier)
        if (!bindings) return []

        const wallets = bindings.proofs.filter((p) => p.platform === Platform.ethereum).map((p) => p.identity)
        return wallets
    }, [receiver])

    useAsync(queryBindings, [queryBindings])

    const allAddresses = useMemo(() => [...(walletsState.value || []), ...addresses], [walletsState.value, addresses])

    const sendTip: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (walletsState.loading || !walletsState.value) {
                await queryBindings()
            }
            if (!allAddresses.length || !receiver?.userId) return
            PluginNextIdMessages.tipTask.sendToLocal({
                recipientSnsId: receiver.userId,
                addresses: allAddresses,
            })
        },
        [walletsState, allAddresses, receiver?.userId],
    )

    if (allAddresses.length === 0) return null

    return (
        <div className={classnames(className, classes.tipButton)} {...rest} role="button" onClick={sendTip}>
            <Currency htmlColor="#8899a6" viewBox="0 0 24 24" />
            {children}
        </div>
    )
}

export const PostTipButton: FC<Props> = (props) => {
    const identifier = usePostInfoDetails.author()
    const { classes } = useStyles()
    return <TipButton {...props} className={classnames(classes.postTipButton, props.className)} receiver={identifier} />
}
