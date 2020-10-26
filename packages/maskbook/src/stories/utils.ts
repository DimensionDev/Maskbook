export function figmaLink(link: string) {
    return {
        design: config({
            type: 'figma',
            url: link,
        }),
    }
}
import { config } from 'storybook-addon-designs'
