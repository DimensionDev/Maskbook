import { PluginId, useActivatedPlugin, usePluginIDContext } from '@masknet/plugin-infra'
import { makeStyles } from '@masknet/theme'
import { EMPTY_LIST } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { useI18N } from '../../../../utils'
import { TargetChainIdContext } from '../../contexts'
import { TipForm } from './TipForm'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
    },
    content: {
        paddingTop: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tab: {
        height: 36,
        minHeight: 36,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        width: 535,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
    },
}))

interface TipDialogProps {
    open?: boolean
    onClose?: () => void
}

export function TipDialog({ open = false, onClose }: TipDialogProps) {
    const pluginID = usePluginIDContext()
    const tipDefinition = useActivatedPlugin(PluginId.NextID, 'any')
    const chainIdList = tipDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST
    const { t } = useI18N()
    const { classes } = useStyles()

    const { targetChainId, setTargetChainId } = TargetChainIdContext.useContainer()

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_tip_tip')}>
            <DialogContent className={classes.content}>
                <div className={classes.abstractTabWrapper}>
                    <NetworkTab
                        classes={classes}
                        chainId={targetChainId}
                        setChainId={setTargetChainId}
                        chains={chainIdList}
                    />
                </div>
                <TipForm />
            </DialogContent>
        </InjectedDialog>
    )
}
