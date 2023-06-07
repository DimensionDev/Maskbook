import { CrossIsolationMessages } from '@masknet/shared-base'

export function openDialog() {
    CrossIsolationMessages.events.ITODialogEvent.sendToLocal({ open: true })
}
