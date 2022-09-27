import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { Icons } from '@masknet/icons'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { TooltipProps } from '@mui/material'
import { MaskMessages } from '../../../../../../shared/index.js'
import {
    useCurrentVisitingIdentity,
    useSocialIdentityByUseId,
} from '../../../../../components/DataSource/useActivatedUI.js'
import { activatedSocialNetworkUI } from '../../../../../social-network/index.js'
import { usePersonaPublicKey } from '../../hooks/usePersonaPublicKey.js'
import { useI18N } from '../../../locales/index.js'
import { PluginTipsMessages } from '../../../messages.js'
import type { Recipient } from '../../../types/index.js'
import { useAccounts } from '../../hooks/useAccounts.js'

interface Props extends HTMLProps<HTMLDivElement> {
    addresses?: Recipient[]
    recipient?: Recipient['address']
    receiver?: ProfileIdentifier
    tooltipProps?: Partial<TooltipProps>
}

const useStyles = makeStyles()({
    button: {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, system-ui, sans-serif',
    },
    tooltip: {
        backgroundColor: 'rgb(102,102,102)',
        color: 'white',
        marginTop: '0 !important',
    },
    disabled: {
        opacity: 0.4,
        cursor: 'default',
    },
})

export const TipsButton: FC<Props> = ({
    className,
    receiver,
    addresses = EMPTY_LIST,
    recipient,
    children,
    tooltipProps,
    ...rest
}) => {
    const { classes, cx } = useStyles()
    const t = useI18N()

    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform!
    const { value: persona, loading: loadingPersona } = usePersonaPublicKey(receiver)
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
    const { value: identity } = useSocialIdentityByUseId(receiver?.userId)

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

    const accounts = useAccounts(identity, personaPubkey, addresses)
    const isChecking = loadingPersona || loadingVerifyInfo
    const disabled = isChecking || !isAccountVerified || accounts.length === 0 || !isRuntimeAvailable

    const createTipTask: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (disabled) return
            if (!accounts.length || !receiverUserId) return
            PluginTipsMessages.tipsTask.sendToLocal({
                recipient,
                recipientSnsId: receiverUserId,
                recipients: accounts,
            })
        },
        [disabled, recipient, accounts, receiverUserId],
    )

    useEffect(() => {
        PluginTipsMessages.tipsTaskUpdate.sendToLocal({
            recipient,
            recipientSnsId: receiverUserId,
            recipients: accounts,
        })
    }, [recipient, receiverUserId, accounts])

    const dom = (
        <div
            className={cx(className, classes.button, disabled ? classes.disabled : null)}
            {...rest}
            role="button"
            onClick={createTipTask}>
            <Icons.TipCoin />
            {children}
        </div>
    )

    if (disabled)
        return (
            <ShadowRootTooltip
                classes={{ tooltip: classes.tooltip }}
                title={isChecking ? '' : t.tip_wallets_missed()}
                placement="bottom"
                arrow={false}
                {...tooltipProps}>
                {dom}
            </ShadowRootTooltip>
        )
    return dom
}
