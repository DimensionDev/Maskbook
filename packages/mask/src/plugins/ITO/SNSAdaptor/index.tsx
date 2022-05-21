import { type Plugin, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { useState } from 'react'
import { ItoLabelIcon } from '../assets/ItoLabelIcon'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { ITO_MetaKey_1, ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import type { JSON_PayloadComposeMask } from '../types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import { CompositionDialog } from './CompositionDialog'
import { set } from 'lodash-unified'
import { Icon } from '@masknet/icons'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { ClaimAllDialog } from './ClaimAllDialog'
import { useFungibleToken } from '@masknet/plugin-infra/web3'
import { formatBalance, NetworkPluginID } from '@masknet/web3-shared-base'
import { Trans } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    span: {
        paddingLeft: theme.spacing(1),
    },
}))

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const payload = ITO_MetadataReader(props.message.meta)
        usePluginWrapper(payload.ok)
        if (!payload.ok) return null
        return <PostInspector payload={set(payloadIntoMask(payload.val), 'token', payload.val.token)} />
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [ITO_MetaKey_1, onAttached_ITO],
        [ITO_MetaKey_2, onAttached_ITO],
    ]),
    CompositionDialogEntry: {
        dialog({ open, onClose, isOpenFromApplicationBoard }) {
            return (
                <CompositionDialog
                    open={open}
                    onConfirm={onClose}
                    onClose={onClose}
                    isOpenFromApplicationBoard={isOpenFromApplicationBoard}
                />
            )
        },
        label: (
            <>
                <Icon type="markets" size={16} />
                ITO
            </>
        ),
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icon type="markets" />
            const name = <Trans i18nKey="plugin_ito_name" />
            const iconFilterColor = 'rgba(56, 228, 239, 0.3)'
            const clickHandler = () =>
                CrossIsolationMessages.events.requestComposition.sendToLocal({
                    reason: 'timeline',
                    open: true,
                    options: {
                        startupPlugin: base.ID,
                        isOpenFromApplicationBoard: true,
                    },
                })

            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <ApplicationEntry
                            {...EntryComponentProps}
                            title={name}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            onClick={
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(clickHandler)
                                    : clickHandler
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 3,
                marketListSortingPriority: 3,
                icon,
                iconFilterColor,
                description: <Trans i18nKey="plugin_ito_description" />,
                category: 'dapp',
                name,
                tutorialLink: 'https://realmasknetwork.notion.site/d84c60903f974f4880d2085a13906d55',
            }
        })(),
        (() => {
            const icon = <Icon type="marketsClaim" />
            const name = <Trans i18nKey="plugin_ito_claim" />
            const iconFilterColor = 'rgba(240, 51, 51, 0.3)'
            return {
                ApplicationEntryID: `${base.ID}_claim`,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)
                    return (
                        <>
                            <ApplicationEntry
                                title={name}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                {...EntryComponentProps}
                                onClick={
                                    EntryComponentProps.onClick
                                        ? () => EntryComponentProps.onClick?.(clickHandler)
                                        : clickHandler
                                }
                            />
                            {open ? <ClaimAllDialog open={open} onClose={() => setOpen(false)} /> : null}
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 4,
                icon,
                name,
                iconFilterColor,
            }
        })(),
    ],
    wrapperProps: {
        icon: <Icon type="markets" size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(27, 144, 238, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(41, 228, 253, 0.2) 100%), #FFFFFF;',
    },
}

function onAttached_ITO(payload: JSON_PayloadComposeMask) {
    return { text: <Badge payload={payload} /> }
}
interface BadgeProps {
    payload: JSON_PayloadComposeMask
}
function Badge({ payload }: BadgeProps) {
    const { classes } = useStyles()
    const { value: tokenDetailed, loading: loadingToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, payload.token)
    const balance = formatBalance(payload.total, tokenDetailed?.decimals)
    const symbol = tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'
    const sellerName = payload.seller.name
        ? payload.seller.name
        : payload.message.split(MSG_DELIMITER)[0] ?? formatEthereumAddress(payload.seller.address, 4)
    return loadingToken ? null : (
        <div className={classes.root}>
            <ItoLabelIcon size={14} />
            <span className={classes.span}>
                A ITO with {balance} ${symbol} from {sellerName}
            </span>
        </div>
    )
}

export default sns
