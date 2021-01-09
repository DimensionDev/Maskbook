import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'

export function useBase64(url: string) {
    return useAsyncRetry(async () => {
        const blob = await Services.Helper.fetch(url)
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (reader.result) resolve(reader.result as string)
                else reject('No content')
            }
            reader.onerror = (e) => reject(e)
            reader.readAsDataURL(blob)
        })
    }, [url])
}
