import { useAsync } from 'react-use'
import { nativeAPI } from '../../utils/native-rpc'

export function NativeQRScanner(props: { onScan?: (val: string) => void; onQuit?: () => void }) {
    useAsync(async () => {
        try {
            if (nativeAPI?.type === 'iOS') {
                props.onScan?.(await nativeAPI.api.scanQRCode())
            } else {
                // TODO:
                throw new Error('Not supported on Android')
            }
        } catch (e) {
            props.onQuit?.()
        }
    })
    return null
}
