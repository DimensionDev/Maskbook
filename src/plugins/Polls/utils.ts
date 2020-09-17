import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import type { PollMetaData } from './types'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>('com.maskbook.poll:1', {})
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)

export function dateFormat(fmt: string, date: Date): string {
    let ret
    const opt = {
        'Y+': date.getFullYear().toString(), // year
        'm+': (date.getMonth() + 1).toString(), // month
        'd+': date.getDate().toString(), // day
        'H+': date.getHours().toString(), // hour
        'M+': date.getMinutes().toString(), // minute
        'S+': date.getSeconds().toString(), // second
    }
    type optKeys = 'Y+' | 'm+' | 'd+' | 'H+' | 'M+' | 'S+'
    for (const k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
            fmt = fmt.replace(
                ret[1],
                ret[1].length === 1 ? opt[k as optKeys] : opt[k as optKeys].padStart(ret[1].length, '0'),
            )
        }
    }
    return fmt
}
