import { TipCoin } from '@masknet/icons'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useCurrentWeb3NetworkPluginID, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { TooltipProps } from '@mui/material'
import classnames from 'classnames'
import { uniq } from 'lodash-unified'
import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../../shared'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { usePublicWallets } from '../hooks/usePublicWallets'
import { useI18N } from '../locales'
import { PluginNextIDMessages } from '../messages'

interface Props extends HTMLProps<HTMLDivElement> {
    addresses?: string[]
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
    children,
    tooltipProps,
    ...rest
}) => {
    const { classes } = useStyles()
    const t = useI18N()

    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: receiverPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!receiver) return
        return Services.Identity.queryPersonaByProfile(receiver)
    }, [receiver])

    const pluginId = useCurrentWeb3NetworkPluginID()
    const {
        value: isAccountVerified,
        loading: loadingVerifyInfo,
        retry: retryLoadVerifyInfo,
    } = useAsyncRetry(() => {
        if (pluginId !== NetworkPluginID.PLUGIN_EVM) return Promise.resolve(true)
        if (!receiverPersona?.identifier.publicKeyAsHex || !receiver?.userId) return Promise.resolve(false)
        return NextIDProof.queryIsBound(receiverPersona.identifier.publicKeyAsHex, platform, receiver.userId, true)
    }, [pluginId, receiverPersona?.identifier.publicKeyAsHex, platform, receiver?.userId])
    const visitingIdentity = useCurrentVisitingIdentity()

    const isVisitingUser = visitingIdentity.identifier?.userId === receiver?.userId
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
        return MaskMessages.events.ownProofChanged.on(() => {
            retryLoadVerifyInfo()
        })
    }, [])

    const publicWallets = usePublicWallets(receiver || undefined)
    const { value: socialAddressList = EMPTY_LIST } = useSocialAddressListAll(visitingIdentity)
    const allAddresses = useMemo(() => {
        switch (pluginId) {
            case NetworkPluginID.PLUGIN_EVM:
                return uniq([...publicWallets, ...addresses])
            case NetworkPluginID.PLUGIN_SOLANA:
                return socialAddressList.filter((x) => x.networkSupporterPluginID === pluginId).map((x) => x.address)
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
            if (!allAddresses.length || !receiver?.userId) return
            PluginNextIDMessages.tipTask.sendToLocal({
                recipientSnsId: receiver.userId,
                addresses: allAddresses,
            })
        },
        [disabled, allAddresses, receiver?.userId],
    )

    useEffect(() => {
        PluginNextIDMessages.tipTaskUpdate.sendToLocal({
            recipientSnsId: receiver?.userId,
            addresses: allAddresses,
        })
    }, [receiver?.userId, allAddresses])

    const dom = (
        <div
            className={classnames(className, classes.tipButton, disabled ? classes.disabled : null)}
            {...rest}
            role="button"
            onClick={createTipTask}>
            <TipCoin viewBox="0 0 24 24" />
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
