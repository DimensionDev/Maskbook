import { Icons } from '@masknet/icons'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../../../shared/index.js'
import {
    useCurrentVisitingIdentity,
    useSocialIdentityByUseId,
} from '../../../../components/DataSource/useActivatedUI.js'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { useProfilePublicKey } from '../../hooks/useProfilePublicKey.js'
import { PluginTipsMessages } from '../../messages.js'
import type { TipsAccount } from '../../types/index.js'
import { useTipsAccounts } from './useTipsAccounts.js'

interface Props extends HTMLProps<HTMLDivElement> {
    addresses?: TipsAccount[]
    recipient?: TipsAccount['address']
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
    addresses = EMPTY_LIST,
    recipient,
    children,
    onStatusUpdate,
    ...rest
}) => {
    const { classes, cx } = useStyles()

    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: persona, loading: loadingPersona } = useProfilePublicKey(receiver)
    const receiverUserId = receiver?.userId
    const personaPubkey = persona?.publicKeyAsHex

    const pluginId = useCurrentWeb3NetworkPluginID()
    const {
        value: isAccountVerified,
        loading: loadingVerifyInfo,
        retry: retryLoadVerifyInfo,
    } = useAsyncRetry(async () => {
        if (pluginId !== NetworkPluginID.PLUGIN_EVM || !platform) return true
        if (!personaPubkey || !receiverUserId) return false
        return NextIDProof.queryIsBound(personaPubkey, platform, receiverUserId, true)
    }, [pluginId, personaPubkey, platform, receiverUserId])
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

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(retryLoadVerifyInfo)
    }, [])

    const tipsAccounts = useTipsAccounts(identity, personaPubkey, addresses)

    const isChecking = loadingPersona || loadingVerifyInfo
    const disabled = isChecking || !isAccountVerified || tipsAccounts.length === 0 || !isRuntimeAvailable
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
                addresses: tipsAccounts,
            })
        },
        [disabled, recipient, tipsAccounts, receiverUserId],
    )

    useEffect(() => {
        PluginTipsMessages.tipTaskUpdate.sendToLocal({
            recipient,
            recipientSnsId: receiverUserId,
            addresses: tipsAccounts,
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
