import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useCurrentWeb3NetworkPluginID } from '@masknet/web3-hooks-base'
import { EMPTY_LIST, ProfileIdentifier, NetworkPluginID } from '@masknet/shared-base'
import type { SocialAccount } from '@masknet/web3-shared-base'
import {
    useCurrentVisitingIdentity,
    useSocialIdentityByUseId,
} from '../../../../components/DataSource/useActivatedUI.js'
import { useProfilePublicKey } from '../../hooks/useProfilePublicKey.js'
import { PluginTipsMessages } from '../../messages.js'
import { useTipsAccounts } from './useTipsAccounts.js'

interface Props extends HTMLProps<HTMLDivElement> {
    accounts?: SocialAccount[]
    recipient?: string
    receiver?: ProfileIdentifier
    onStatusUpdate?(disabled: boolean): void
}

const useStyles = makeStyles()({
    tipButton: {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, system-ui, sans-serif',
    },
})

// TODO: reduce re-render
export const TipButton: FC<Props> = ({
    className,
    receiver,
    accounts = EMPTY_LIST,
    recipient,
    children,
    onStatusUpdate,
    ...rest
}) => {
    const { classes, cx } = useStyles()

    const { value: personaPubkey, loading: loadingPersona } = useProfilePublicKey(receiver)
    const receiverUserId = receiver?.userId

    const pluginId = useCurrentWeb3NetworkPluginID()

    const visitingIdentity = useCurrentVisitingIdentity()
    const { value: identity } = useSocialIdentityByUseId(receiverUserId)

    const isVisitingUser = visitingIdentity.identifier?.userId === receiverUserId
    const isRuntimeAvailable = useMemo(() => {
        switch (pluginId) {
            case NetworkPluginID.PLUGIN_EVM:
                return true
            case NetworkPluginID.PLUGIN_SOLANA:
                return isVisitingUser
        }
        return false
    }, [pluginId, isVisitingUser])

    const tipsAccounts = useTipsAccounts(identity, personaPubkey, accounts)

    const isChecking = loadingPersona
    const disabled = isChecking || tipsAccounts.length === 0 || !isRuntimeAvailable
    useEffect(() => {
        onStatusUpdate?.(disabled)
    }, [disabled])

    const createTipTask: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (disabled) return
            if (!tipsAccounts.length || !receiverUserId) return
            PluginTipsMessages.tipTask.sendToLocal({
                recipient,
                recipientSnsId: receiverUserId,
                accounts: tipsAccounts,
            })
        },
        [disabled, recipient, tipsAccounts, receiverUserId],
    )

    useEffect(() => {
        if (!receiverUserId || !tipsAccounts.length) return
        PluginTipsMessages.tipTaskUpdate.sendToLocal({
            recipient,
            recipientSnsId: receiverUserId,
            accounts: tipsAccounts,
        })
    }, [recipient, receiverUserId, tipsAccounts])

    if (disabled) return null

    return (
        <div className={cx(className, classes.tipButton)} {...rest} role="button" onClick={createTipTask}>
            <Icons.TipCoin />
            {children}
        </div>
    )
}
