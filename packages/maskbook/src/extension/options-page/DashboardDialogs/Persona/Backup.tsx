import { useEffect, useState } from 'react'
import { User } from 'react-feather'
import { useI18N, compressBackupFile, encodeArrayBuffer, encodeText } from '../../../../utils'
import { QRCode } from '@masknet/shared'
import Services from '../../../service'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import ShowcaseBox from '../../DashboardComponents/ShowcaseBox'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { PersonaProps } from './types'

export function DashboardPersonaBackupDialog(props: WrappedDialogProps<PersonaProps>) {
    const { t } = useI18N()
    const { persona } = props.ComponentProps!
    const mnemonicWordsValue = persona.mnemonic?.words ?? t('not_available')
    const [base64Value, setBase64Value] = useState(t('not_available'))
    const [compressedQRString, setCompressedQRString] = useState<string | null>(null)
    useEffect(() => {
        Services.Welcome.generateBackupJSON({
            noPosts: true,
            noUserGroups: true,
            filter: { type: 'persona', wanted: [persona.identifier] },
        }).then((file) => {
            setBase64Value(encodeArrayBuffer(encodeText(JSON.stringify(file))))
            setCompressedQRString(
                compressBackupFile(file, {
                    personaIdentifier: persona.identifier,
                }),
            )
        })
    }, [persona.identifier])

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                id: 'mnemonic',
                label: t('mnemonic_words'),
                children: <ShowcaseBox>{mnemonicWordsValue}</ShowcaseBox>,
            },
            {
                id: 'base64',
                label: 'Base64',
                children: <ShowcaseBox>{base64Value}</ShowcaseBox>,
            },
            {
                id: 'qr',
                label: t('qr_code'),
                children: compressedQRString ? (
                    <QRCode
                        text={compressedQRString}
                        options={{ width: 200 }}
                        canvasProps={{
                            style: { display: 'block', margin: 'auto' },
                        }}
                    />
                ) : null,
            },
        ],
        state,
        height: 200,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<User />}
                iconColor="#5FDD97"
                primary={t('backup_persona')}
                secondary={t('dashboard_backup_persona_hint')}
                content={<AbstractTab {...tabProps} />}
            />
        </DashboardDialogCore>
    )
}
