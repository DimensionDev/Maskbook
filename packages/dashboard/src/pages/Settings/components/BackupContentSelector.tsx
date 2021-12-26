import { Box, Checkbox, Typography, experimentalStyled as styled } from '@mui/material'
import { useDashboardI18N } from '../../../locales'
import type { BackupPreview } from './BackupPreviewCard'
import { MaskColorVar } from '@masknet/theme'
import { useState } from 'react'
import { useEffect } from 'react'

const SelectItem = styled('div')(({ theme }) => ({
    borderRadius: 8,
    backgroundColor: MaskColorVar.lightBackground,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
}))

const CheckboxContainer = styled('div')(() => ({
    width: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
}))

const BackupItem = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
}))

export interface BackupContentCheckedStatus {
    baseChecked: boolean
    walletChecked: boolean
}

export interface BackupContentSelectorProps {
    json: BackupPreview
    onChange(data: BackupContentCheckedStatus): void
}

export default function BackupContentSelector({ json, onChange }: BackupContentSelectorProps) {
    const t = useDashboardI18N()
    const records = [
        {
            name: t.settings_backup_preview_personas(),
            value: json.personas,
        },
        {
            name: t.settings_backup_preview_associated_account(),
            value: json.accounts,
            sub: true,
        },
        {
            name: t.settings_backup_preview_posts(),
            value: json.posts,
            sub: true,
        },
        {
            name: t.settings_backup_preview_contacts(),
            value: json.contacts,
            sub: true,
        },
        {
            name: t.settings_backup_preview_fils(),
            value: json.files,
            sub: true,
        },
    ]

    const [baseChecked, setBaseChecked] = useState(true)
    const [walletChecked, setWalletChecked] = useState(false)

    useEffect(() => {
        onChange({
            baseChecked,
            walletChecked,
        })
    }, [baseChecked, walletChecked])

    return (
        <Box>
            <SelectItem>
                <CheckboxContainer>
                    <Checkbox
                        checked={baseChecked}
                        onChange={(event) => setBaseChecked(event.target.checked)}
                        name="base"
                    />
                </CheckboxContainer>
                <Box sx={{ flex: 1 }}>
                    {records.map((record, idx) => (
                        <BackupItem key={idx}>
                            <Typography variant="body2">{record.name}</Typography>
                            <Typography variant="body2">{record.value}</Typography>
                        </BackupItem>
                    ))}
                </Box>
            </SelectItem>
            {json.wallets ? (
                <SelectItem>
                    <CheckboxContainer>
                        <Checkbox
                            checked={walletChecked}
                            onChange={(event) => setWalletChecked(event.target.checked)}
                            name="wallet"
                        />
                    </CheckboxContainer>
                    <BackupItem sx={{ flex: 1 }}>
                        <Typography variant="body2">{t.settings_backup_preview_wallets()}</Typography>
                        <Typography variant="body2">{json.wallets}</Typography>
                    </BackupItem>
                </SelectItem>
            ) : null}
        </Box>
    )
}
