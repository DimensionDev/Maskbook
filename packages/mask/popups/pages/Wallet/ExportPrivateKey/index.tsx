import { memo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import { Box, Tab, Typography, useTheme } from '@mui/material'
import { ImportSource, MimeType } from '@masknet/shared-base'
import { TabContext, TabPanel } from '@mui/lab'
import { Icons } from '@masknet/icons'
import { format as formatDateTime } from 'date-fns'
import { ActionButton, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { useWallet } from '@masknet/web3-hooks-base'
import { encodeText } from '@masknet/kit'
import { useTitle } from '../../../hooks/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import Services from '#services'
import { NormalHeader } from '../../../components/index.js'
import { saveFileFromBuffer } from '../../../../shared/index.js'
import { MnemonicDisplay } from '../../../components/MnemonicDisplay/index.js'
import { PrivateKeyDisplay } from '../../../components/PrivateKeyDisplay/index.js'
import { useWalletGroup } from '../../../hooks/useWalletGroup.js'
import { Trans } from '@lingui/macro'

enum TabType {
    Mnemonic = 'Mnemonic',
    PrivateKey = 'Private Key',
    JsonFile = 'Json File',
}

const useStyles = makeStyles()((theme) => ({
    tabs: {
        flex: 'none!important',
        paddingTop: '0px!important',
        paddingLeft: 16,
        paddingRight: 16,
        '& > button': {
            padding: theme.spacing(1, 1.5),
        },
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
            theme.palette.mode === 'light' ?
                'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.20) 0%, rgba(59, 153, 252, 0.20) 100%)'
            :   'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

export const Component = memo(function ExportPrivateKey() {
    const theme = useTheme()
    const { classes } = useStyles()
    const wallet = useWallet()
    const walletGroup = useWalletGroup()

    const { state } = useLocation()

    const [{ loading }, onExport] = useAsyncFn(async () => {
        if (!wallet?.address) return
        const now = formatDateTime(Date.now(), 'yyyy-MM-dd')
        const jsonFile = await Services.Wallet.exportKeyStoreJSON(wallet.address, state?.password)
        // TODO: The address parameter should be returned by the sdk and not displayed as such. We need to wait for the sdk to be upgraded.
        await saveFileFromBuffer({
            fileContent: encodeText(
                JSON.stringify({
                    ...JSON.parse(jsonFile),
                    address: wallet.address.slice(2),
                }),
            ),
            fileName: `mask-network-keystore-backup-${now}.json`,
            mimeType: MimeType.JSON,
        })
    }, [wallet?.address, state?.password])

    const { loading: getMnemonicLoading, value: mnemonic } = useAsync(async () => {
        if (!wallet) return

        const words = await Services.Wallet.exportMnemonicWords(wallet.address).catch(() => '')
        if (!words) {
            const primaryWallet =
                wallet.mnemonicId ? await Services.Wallet.getPrimaryWalletByMnemonicId(wallet.mnemonicId)
                : wallet.source === ImportSource.LocalGenerated ? await Services.Wallet.getWalletPrimary()
                : null

            if (!primaryWallet) return
            const primaryWalletWords = await Services.Wallet.exportMnemonicWords(primaryWallet.address)
            if (!primaryWalletWords) return
            return primaryWalletWords.split(' ')
        }

        return words.split(' ')
    }, [wallet])

    const [currentTab, onChange] = useTabs(
        state.hasMnemonic ? TabType.Mnemonic : TabType.PrivateKey,
        TabType.PrivateKey,
        TabType.JsonFile,
    )

    useTitle(wallet?.name ? wallet.name : '')

    return (
        <TabContext value={currentTab}>
            <NormalHeader
                tabList={
                    !getMnemonicLoading && mnemonic ?
                        <MaskTabList onChange={onChange} aria-label="persona-tabs" classes={{ root: classes.tabs }}>
                            <Tab label={<Trans>Mnemonic</Trans>} value={TabType.Mnemonic} />
                            <Tab label={<Trans>Private Key</Trans>} value={TabType.PrivateKey} />
                            <Tab label={<Trans>Keystore</Trans>} value={TabType.JsonFile} />
                        </MaskTabList>
                    :   <MaskTabList onChange={onChange} aria-label="persona-tabs" classes={{ root: classes.tabs }}>
                            <Tab label={<Trans>Private Key</Trans>} value={TabType.PrivateKey} />
                            <Tab label={<Trans>Keystore</Trans>} value={TabType.JsonFile} />
                        </MaskTabList>
                }
            />
            <Box p={2} display="flex" flexDirection="column" rowGap={2} flex={1}>
                {!getMnemonicLoading && mnemonic ?
                    <TabPanel className={classes.panel} value={TabType.Mnemonic}>
                        <Typography sx={{ fontSize: 14, lineHeight: '18px', fontWeight: 700 }}>
                            <Trans>Write down mnemonic words</Trans>
                        </Typography>
                        <Typography
                            sx={{ py: 2, color: theme.palette.maskColor.second, fontSize: 14, lineHeight: '18px' }}>
                            <Trans>
                                Please write down the following words in correct order. Keep it safe and do not share
                                with anyone!
                            </Trans>
                        </Typography>
                        <MnemonicDisplay mnemonic={mnemonic} />
                    </TabPanel>
                :   null}
                <TabPanel className={classes.panel} value={TabType.PrivateKey}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: '18px' }}>
                        <Trans>Click on the down-arrow to see the private key.</Trans>
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="column"
                        mt={2}
                        rowGap={2}
                        maxHeight="450px"
                        overflow="auto"
                        data-hide-scrollbar>
                        {(
                            wallet?.mnemonicId &&
                            walletGroup?.groups[wallet.mnemonicId] &&
                            walletGroup.groups[wallet.mnemonicId].length > 1
                        ) ?
                            walletGroup.groups[wallet.mnemonicId].map((x, index) => (
                                <PrivateKeyDisplay wallet={x} key={index} />
                            ))
                        : wallet ?
                            <PrivateKeyDisplay wallet={wallet} hiddenArrow />
                        :   null}
                    </Box>
                </TabPanel>
                <TabPanel className={classes.panel} value={TabType.JsonFile}>
                    <Box className={classes.iconWrapper}>
                        <Icons.EncryptedFiles size={36} />
                    </Box>
                    <Typography color={theme.palette.maskColor.danger}>
                        <Trans>
                            This JSON file is encrypted with your current payment password. The same password is
                            required for decryption when importing this wallet.
                        </Trans>
                    </Typography>
                </TabPanel>
            </Box>

            {currentTab === TabType.JsonFile ?
                <BottomController>
                    <ActionButton onClick={onExport} fullWidth loading={loading} disabled={loading}>
                        <Trans>Export</Trans>
                    </ActionButton>
                </BottomController>
            :   null}
        </TabContext>
    )
})
