import { TextField } from '@mui/material'
import { useState } from 'react'
import { Search } from 'react-feather'
import { useI18N } from '../../../../utils'
import ActionButton from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'

export function DashboardContactSearchDialog(props: WrappedDialogProps<{ onSearch: (text: string) => void }>) {
    const { t } = useI18N()
    const { onSearch } = props.ComponentProps!
    const [text, setText] = useState('')

    const searchText = () => {
        if (!text) return
        props.onClose()
        onSearch(text)
    }

    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<Search />}
                iconColor="#5FDD97"
                primary={t('search_contact')}
                content={
                    <form>
                        <TextField
                            autoFocus
                            required
                            label={t('keywords')}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    searchText()
                                }
                            }}
                            variant="outlined"
                        />
                    </form>
                }
                footer={
                    <SpacedButtonGroup>
                        <ActionButton variant="contained" disabled={!text} onClick={searchText}>
                            {t('search')}
                        </ActionButton>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
