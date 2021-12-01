import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import AnimatePic from './animate'
import { PetDialog } from './PetDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return (
            <>
                <AnimatePic />
                <PetDialog />
            </>
        )
    },
}

export default sns
