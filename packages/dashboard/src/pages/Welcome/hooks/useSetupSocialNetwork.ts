import { useAsyncFn } from 'react-use'
import { Services } from '../../../API'

export function useSetupSocialNetwork() {
    return useAsyncFn(Services.SocialNetwork.setupSocialNetwork)
}
