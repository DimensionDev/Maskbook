import { memo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsync, useAsyncFn, useCopyToClipboard } from 'react-use'
import { Box, Tab, Typography, useTheme } from '@mui/material'
import { MimeType } from '@masknet/shared-base'
import { TabContext, TabPanel } from '@mui/lab'
import { Icons } from '@masknet/icons'
import formatDateTime from 'date-fns/format'
import { ActionButton, usePopupCustomSnackbar, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { useWallet } from '@masknet/web3-hooks-base'
import { encodeText } from '@masknet/kit'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { NormalHeader } from '../../../components/index.js'
import { saveFileFromBuffer } from '../../../../../../shared/index.js'

enum TabType {
    PrivateKey = 'Private Key',
    JsonFile = 'Json File',
}

const useStyles = makeStyles()((theme) => ({
    tabs: {
        flex: 'none!important',
        paddingTop: '0px!important',
        paddingLeft: 16,
        paddingRight: 16,
    },
    panel: {
        padding: theme.spacing(0),
        background: theme.palette.maskColor.bottom,
        flex: 1,
        overflow: 'auto',
    },
    iconWrapper: {
        height: 120,
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.20) 0%, rgba(59, 153, 252, 0.20) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

const ExportPrivateKey = memo(function ExportPrivateKey() {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()
    const wallet = useWallet()
    const { showSnackbar } = usePopupCustomSnackbar()
    const [, copyToClipboard] = useCopyToClipboard()
    const { state } = useLocation()
    const { value } = useAsync(async () => {
        if (!wallet) return

        return {
            jsonFile: await WalletRPC.exportKeyStoreJSON(wallet.address, state?.password),
            privateKey: await WalletRPC.exportPrivateKey(wallet.address, state?.password),
        }
    }, [wallet, state?.password])

    const [currentTab, onChange] = useTabs(TabType.PrivateKey, TabType.JsonFile)

    const handleCopy = useCallback(() => {
        if (!value?.privateKey) return
        copyToClipboard(value?.privateKey)
        showSnackbar(t('copied'))
    }, [value?.privateKey])

    const [{ loading }, onExport] = useAsyncFn(async () => {
        const now = formatDateTime(Date.now(), 'yyyy-MM-dd')
        await saveFileFromBuffer({
            fileContent: encodeText(JSON.stringify(value?.jsonFile)),
            fileName: `mask-network-keystore-backup-${now}.json`,
            mimeType: MimeType.JSON,
        })
    }, [value?.jsonFile])

    useTitle(t('popups_wallet_backup_private_key'))

    return (
        <TabContext value={currentTab}>
            <NormalHeader
                tabList={
                    <MaskTabList onChange={onChange} aria-label="persona-tabs" classes={{ root: classes.tabs }}>
                        <Tab label={t('popups_wallet_name_private_key')} value={TabType.PrivateKey} />
                        <Tab label={t('popups_wallet_name_json_file')} value={TabType.JsonFile} />
                    </MaskTabList>
                }
            />
            <Box p={2} display="flex" flexDirection="column" rowGap={2}>
                <TabPanel className={classes.panel} value={TabType.PrivateKey}>
                    {value?.privateKey ? (
                        <Typography
                            p={1.5}
                            style={{
                                background: theme.palette.maskColor.input,
                                wordWrap: 'break-word',
                                borderRadius: 8,
                                height: 240,
                            }}>
                            {value?.privateKey}
                        </Typography>
                    ) : null}
                </TabPanel>
                <TabPanel className={classes.panel} value={TabType.JsonFile}>
                    <Box className={classes.iconWrapper}>
                        <Icons.EncryptedFiles size={36} />
                    </Box>
                    <Typography color={theme.palette.maskColor.danger}>{t('popups_export_json_file_tips')}</Typography>
                </TabPanel>
            </Box>
            <BottomController>
                {currentTab === TabType.PrivateKey ? (
                    <ActionButton onClick={handleCopy} fullWidth>
                        {t('copy')}
                    </ActionButton>
                ) : (
                    <ActionButton onClick={onExport} fullWidth loading={loading} disabled={loading}>
                        {t('export')}
                    </ActionButton>
                )}
            </BottomController>
        </TabContext>
    )
})

export default ExportPrivateKey
