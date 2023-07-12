import { Trans } from 'react-i18next'
import { set } from 'lodash-es'
import { type Plugin, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { PostInspector } from './PostInspector.js'
import { base } from '../base.js'
import { ITO_MetaKey_1, ITO_MetaKey_2, MSG_DELIMITER } from '../constants.js'
import type { JSON_PayloadComposeMask } from '../types.js'
import { ITO_MetadataReader, payloadIntoMask } from './helpers.js'
import { CompositionDialog } from './CompositionDialog.js'
import { Icons } from '@masknet/icons'
import { ApplicationEntry } from '@masknet/shared'
import { EnhanceableSite, PluginID, SOCIAL_MEDIA_NAME, getSiteType } from '@masknet/shared-base'
import { ITOInjection } from './ITOInjection.js'
import { openDialog } from './emitter.js'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
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
    GlobalInjection: ITOInjection,
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
                <Icons.Markets size={16} />
                <Trans i18nKey="plugin_ito_name" />
            </>
        ),
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Markets size={36} />
            const name = <Trans i18nKey="plugin_ito_name" ns={PluginID.ITO} />

            const iconFilterColor = 'rgba(56, 228, 239, 0.3)'

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
                                    ? () => EntryComponentProps.onClick?.(openDialog)
                                    : openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 6,
                marketListSortingPriority: 6,
                icon,
                iconFilterColor,
                description: (
                    <Trans
                        i18nKey="plugin_ito_description"
                        values={{ sns: SOCIAL_MEDIA_NAME[getSiteType() ?? EnhanceableSite.Twitter] }}
                    />
                ),
                category: 'dapp',
                name,
                tutorialLink: 'https://realmasknetwork.notion.site/d84c60903f974f4880d2085a13906d55',
            }
        })(),
    ],
    wrapperProps: {
        icon: <Icons.Markets size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(27, 144, 238, 0.2))' }} />,
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
    return (
        <div className={classes.root}>
            <Icons.ITOLabel size={14} />
            <Typography
                fontSize="12px"
                lineHeight="16px"
                marginLeft="8px"
                maxWidth="450px"
                overflow="hidden"
                textOverflow="ellipsis">
                {payload.message.split(MSG_DELIMITER)[1] || payload.message || 'ITO'}
            </Typography>
        </div>
    )
}

export default sns
