import { Annotations, BaseStory } from '@storybook/addons'
import { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types'
import { Meta, Story } from '@storybook/react/types-6-0'

/**
 * Create a typed story of a given component
 *
 * @example
 * const { meta, of } = story(Button)
 * export default meta({})
 * export const story1 = of({})
 * export const story2 = of({})
 */
export function story<T>(Component: React.ComponentType<T>) {
    return {
        meta(meta: Meta<T>): Meta<T> {
            return { ...meta, component: Component }
        },
        of(annotations: Annotations<T, StoryFnReactReturnType> & Pick<BaseStory<any, any>, 'storyName'> = {}) {
            const copy: Story<T> = (props: T) => <Component {...props} />
            Object.assign(copy, annotations)
            return copy
        },
    }
}
