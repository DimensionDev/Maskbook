import type { BackupAccountType, SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useState } from 'react'
import { MergeBackupDialog } from './MergeBackupDialog.js'

export interface MergeBackupModalOpenProps {
    downloadLink: string
    account: string
    uploadedAt: string
    size: string
    code: string
    abstract?: string
    type: BackupAccountType
}

export function MergeBackupModal({ ref }: SingletonModalProps<MergeBackupModalOpenProps>) {
    const [downloadLink, setDownloadLink] = useState('')
    const [code, setCode] = useState('')
    const [type, setType] = useState<BackupAccountType>()
    const [account, setAccount] = useState('')
    const [abstract, setAbstract] = useState('')
    const [uploadedAt, setUploadedAt] = useState('')
    const [size, setSize] = useState('')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            if (props.abstract) setAbstract(props.abstract)
            setCode(props.code)
            setType(props.type)
            setDownloadLink(props.downloadLink)
            setAccount(props.account)
            setUploadedAt(props.uploadedAt)
            setSize(props.size)
        },
        onClose(props) {
            setCode('')
            setType(undefined)
            setDownloadLink('')
            setAccount('')
            setSize('')
            setUploadedAt('')
        },
    })

    return (
        <MergeBackupDialog
            open={open}
            type={type}
            code={code}
            abstract={abstract}
            onClose={() => dispatch?.close()}
            account={account}
            downloadLink={downloadLink}
            size={size}
            uploadedAt={uploadedAt}
        />
    )
}
