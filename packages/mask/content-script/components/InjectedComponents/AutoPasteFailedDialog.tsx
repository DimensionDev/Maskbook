import { AutoPasteFailedDialog, useAutoPasteFailedDialogState } from '@masknet/injected-ui/AutoPasteFailedDialog'
import { DraggableDiv } from '../shared/DraggableDiv.js'
import { saveFileFromUrl } from '../../../shared/index.js'

export function useAutoPasteFailedDialog() {
    const { show, open, data, close } = useAutoPasteFailedDialogState()
    return [
        show,
        open ?
            <DraggableDiv key="auto-paste-failed-dialog">
                <AutoPasteFailedDialog onClose={close} data={data} onDownload={saveFileFromUrl} />
            </DraggableDiv>
        :   null,
    ] as const
}
