import { TipCoin } from '@masknet/icons'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useCurrentWeb3NetworkPluginID, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import type { TooltipProps } from '@mui/material'
import classnames from 'classnames'
import { uniqBy } from 'lodash-unified'
import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../../shared'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useProfilePublicKey } from '../hooks/useProfilePublicKey'
import { usePublicWallets } from '../hooks/usePublicWallets'
import { useI18N } from '../locales'
import { PluginNextIDMessages } from '../messages'
import type { TipAccount } from '../types'

interface Props extends HTMLProps<HTMLDivElement> {
    addresses?: TipAccount[]
    recipient?: TipAccount['address']
    receiver?: ProfileIdentifier | null
    tooltipProps?: Partial<TooltipProps>
}

const useStyles = makeStyles()({
    tipButton: {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, system-ui, sans-serif',
    },
    buttonWrapper: {
        // temporarily hard code
        height: 46,
        display: 'flex',
        alignItems: 'center',
        color: '#8899a6',
    },
    postTipButton: {
        cursor: 'pointer',
        width: 34,
        height: 34,
        borderRadius: '100%',
        '&:hover': {
            backgroundColor: 'rgba(20,155,240,0.1)',
        },
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

export const TipButton: FC<Props> = ({
    className,
    receiver,
    addresses = EMPTY_LIST,
    recipient,
    children,
    tooltipProps,
    ...rest
}) => {
    const { classes } = useStyles()
    const t = useI18N()

    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: personaPubkey, loading: loadingPersona } = useProfilePublicKey(receiver)
    const receiverUserId = receiver?.userId

    const pluginId = useCurrentWeb3NetworkPluginID()
    const {
        value: isAccountVerified,
        loading: loadingVerifyInfo,
        retry: retryLoadVerifyInfo,
    } = useAsyncRetry(async () => {
        if (pluginId !== NetworkPluginID.PLUGIN_EVM) return true
        if (!personaPubkey || !receiverUserId) return false
        return NextIDProof.queryIsBound(personaPubkey, platform, receiverUserId, true)
    }, [pluginId, personaPubkey, platform, receiverUserId])
    const visitingIdentity = useCurrentVisitingIdentity()

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

    const publicWallets = usePublicWallets(personaPubkey)
    const { value: socialAddressList = EMPTY_LIST } = useSocialAddressListAll(visitingIdentity)
    const allAddresses = useMemo(() => {
        switch (pluginId) {
            case NetworkPluginID.PLUGIN_EVM:
                const evmAddresses = socialAddressList
                    .filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
                    .map((x) => ({
                        address: x.address,
                        name: x.type === SocialAddressType.ENS ? x.label : undefined,
                    }))
                return uniqBy([...publicWallets, ...addresses, ...evmAddresses], (v) => v.address.toLowerCase())
            case NetworkPluginID.PLUGIN_SOLANA:
                return socialAddressList
                    .filter((x) => x.networkSupporterPluginID === pluginId)
                    .map((x) => ({
                        address: x.address,
                        name: x.type === SocialAddressType.SOL ? x.label : undefined,
                    }))
        }
        return EMPTY_LIST
    }, [pluginId, publicWallets, addresses, socialAddressList])

    const isChecking = loadingPersona || loadingVerifyInfo
    const disabled = isChecking || !isAccountVerified || allAddresses.length === 0 || !isRuntimeAvailable

    const createTipTask: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (disabled) return
            if (!allAddresses.length || !receiverUserId) return
            PluginNextIDMessages.tipTask.sendToLocal({
                recipient,
                recipientSnsId: receiverUserId,
                addresses: allAddresses,
            })
        },
        [disabled, recipient, allAddresses, receiverUserId],
    )

    useEffect(() => {
        PluginNextIDMessages.tipTaskUpdate.sendToLocal({
            recipient,
            recipientSnsId: receiverUserId,
            addresses: allAddresses,
        })
    }, [recipient, receiverUserId, allAddresses])

    const dom = (
        <div
            className={classnames(className, classes.tipButton, disabled ? classes.disabled : null)}
            {...rest}
            role="button"
            onClick={createTipTask}>
            <TipCoin />
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

export const PostTipButton: FC<Props> = ({ className, ...rest }) => {
    const identifier = usePostInfoDetails.author()
    const { classes } = useStyles()
    return (
        <div className={classes.buttonWrapper}>
            <TipButton className={classnames(classes.postTipButton, className)} {...rest} receiver={identifier} />
        </div>
    )
}
