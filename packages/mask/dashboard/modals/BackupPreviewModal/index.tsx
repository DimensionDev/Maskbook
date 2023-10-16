import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { forwardRef, useState } from 'react'
import { BackupPreviewDialog } from './BackupPreviewDialog.js'
import type { AccountType } from '../../type.js'

export interface BackupPreviewModalOpenProps {
    isOverwrite?: boolean
    code: string
    type: AccountType
    account: string
    abstract?: string
}

interface BackupPreviewModalProps {}

export const BackupPreviewModal = forwardRef<
    SingletonModalRefCreator<BackupPreviewModalOpenProps>,
    BackupPreviewModalProps
>((props, ref) => {
    const [isOverwrite, setIsOverwrite] = useState(false)
    const [code, setCode] = useState('')
    const [type, setType] = useState<AccountType>()
    const [account, setAccount] = useState('')
    const [abstract, setAbstract] = useState('')

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            if (props.isOverwrite) setIsOverwrite(props.isOverwrite)
            if (props.abstract) setAbstract(props.abstract)
            setCode(props.code)
            setType(props.type)
            setAccount(props.account)
        },
        onClose(props) {
            setIsOverwrite(false)
            setAbstract('')
            setCode('')
            setType(undefined)
            setAccount('')
        },
    })

    if (!open || !type) return null
    return (
        <BackupPreviewDialog
            open
            onClose={() => dispatch?.close()}
            isOverwrite={isOverwrite}
            code={code}
            type={type}
            account={account}
            abstract={abstract}
        />
    )
})
