import { Currency } from '@masknet/icons'
import { usePostInfoDetails } from '@masknet/plugin-infra'
import { NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { EMPTY_LIST } from '@masknet/web3-shared-evm'
import classnames from 'classnames'
import { uniq } from 'lodash-unified'
import { FC, HTMLProps, MouseEventHandler, useCallback, useMemo } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import Services from '../../../../extension/service'
import { PluginNextIdMessages } from '../../messages'

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
    disabled: {
        opacity: 0.4,
        cursor: 'default',
    },
})

export const TipButton: FC<Props> = ({ className, receiver, addresses = [], children, ...rest }) => {
    const { classes } = useStyles()

    const [walletsState, queryBindings] = useAsyncFn(async () => {
        if (!receiver) return EMPTY_LIST

        const persona = await Services.Identity.queryPersonaByProfile(receiver)
        if (!persona) return EMPTY_LIST

        const bindings = await Services.Helper.queryExistedBinding(persona.identifier)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs.filter((p) => p.platform === NextIDPlatform.Ethereum).map((p) => p.identity)
        return wallets
    }, [receiver])

    useAsync(queryBindings, [queryBindings])

    const allAddresses = useMemo(() => {
        return uniq([...(walletsState.value || []), ...addresses])
    }, [walletsState.value, addresses])

    const disabled = allAddresses.length === 0

    const sendTip: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (disabled) return
            if (walletsState.loading || !walletsState.value) {
                await queryBindings()
            }
            if (!allAddresses.length || !receiver?.userId) return
            PluginNextIdMessages.tipTask.sendToLocal({
                recipientSnsId: receiver.userId,
                addresses: allAddresses,
            })
        },
        [disabled, walletsState, allAddresses, receiver?.userId],
    )

    return (
        <div
            className={classnames(className, classes.tipButton, disabled ? classes.disabled : null)}
            {...rest}
            role="button"
            onClick={sendTip}>
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
