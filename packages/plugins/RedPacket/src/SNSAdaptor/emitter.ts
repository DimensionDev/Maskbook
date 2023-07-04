import { CrossIsolationMessages } from '@masknet/shared-base'

export function openDialog() {
    CrossIsolationMessages.events.redpacketDialogEvent.sendToLocal({ open: true })
}
