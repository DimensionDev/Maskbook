import type { BackupSummary } from '@masknet/backup-format'
import { produce } from 'immer'
import { type BackupFileInfo } from '../../../utils/type.js'
import { BackupAccountType } from '@masknet/shared-base'

export enum RestoreStep {
    InputEmail = 'InputEmail',
    InputPhone = 'InputPhone',
    Decrypt = 'Decrypt',
    Restore = 'Restore',
}

export interface RestoreState {
    loading: boolean
    accountType: BackupAccountType
    account: string
    password: string
    step: RestoreStep
    emailForm: {
        account: string
        code: string
    }
    phoneForm: {
        account: string
        code: string
        dialingCode: string
        phone: string
    }
    backupFileInfo: BackupFileInfo | null
    backupSummary: BackupSummary | null
    backupDecrypted: string
}

export const initialState: RestoreState = {
    loading: false,
    accountType: BackupAccountType.Email,
    account: '',
    password: '',
    step: RestoreStep.InputEmail,
    emailForm: {
        account: '',
        code: '',
    },
    phoneForm: {
        dialingCode: '',
        phone: '',
        account: '',
        code: '',
    },
    backupFileInfo: null,
    backupSummary: null,
    backupDecrypted: '',
}

type Action =
    | {
          type: 'SET_ACCOUNT_TYPE'
          accountType: BackupAccountType
      }
    | {
          type: 'NEXT_STEP'
      }
    | {
          type: 'TO_STEP'
          step: RestoreStep
      }
    | {
          type: 'TO_INPUT'
      }
    | {
          type: 'SET_EMAIL'
          form: Partial<RestoreState['emailForm']>
      }
    | {
          type: 'SET_PHONE'
          form: Partial<RestoreState['phoneForm']>
      }
    | {
          type: 'SET_VALIDATION'
      }
    | {
          type: 'SET_BACKUP_INFO'
          info: BackupFileInfo
      }
    | {
          type: 'SET_BACKUP_SUMMARY'
          summary: BackupSummary
          backupDecrypted: string
      }
    | {
          type: 'SET_PASSWORD'
          password: string
      }
    | {
          type: 'SET_LOADING'
          loading: boolean
      }

function stepReducer(step: RestoreStep) {
    switch (step) {
        case RestoreStep.InputEmail:
        case RestoreStep.InputPhone:
            return RestoreStep.Decrypt
        case RestoreStep.Decrypt:
            return RestoreStep.Restore
        default:
            return step
    }
}

export function restoreReducer(state: RestoreState, action: Action) {
    return produce(state, (draft) => {
        switch (action.type) {
            case 'SET_ACCOUNT_TYPE':
                draft.accountType = action.accountType
                break
            case 'NEXT_STEP':
                draft.step = stepReducer(draft.step)
                break
            case 'TO_STEP':
                draft.step = action.step
                break
            case 'TO_INPUT':
                draft.step =
                    draft.accountType === BackupAccountType.Email ? RestoreStep.InputEmail : RestoreStep.InputPhone
                break
            case 'SET_EMAIL':
                Object.assign(draft.emailForm, action.form)
                if (action.form.code) draft.emailForm.code = action.form.code.replaceAll(/\D/g, '')
                break
            case 'SET_PHONE':
                Object.assign(draft.phoneForm, action.form)
                draft.phoneForm.account = `+${draft.phoneForm.dialingCode} ${draft.phoneForm.phone}`
                if (action.form.code) draft.phoneForm.code = action.form.code.replaceAll(/\D/g, '')
                break
            case 'SET_VALIDATION':
                break
            case 'SET_BACKUP_INFO':
                draft.backupFileInfo = action.info
                break
            case 'SET_PASSWORD':
                draft.password = action.password
                break
            case 'SET_BACKUP_SUMMARY':
                draft.backupSummary = action.summary
                draft.backupDecrypted = action.backupDecrypted
                break
            case 'SET_LOADING':
                draft.loading = action.loading
                break
        }

        // Update current account
        draft.account =
            draft.accountType === BackupAccountType.Email ? draft.emailForm.account : draft.phoneForm.account
    })
}
