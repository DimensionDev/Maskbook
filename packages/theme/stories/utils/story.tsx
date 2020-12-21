import type { Annotations, BaseStory } from '@storybook/addons'
import type { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types'
import type { Meta, Story } from '@storybook/react/types-6-0'

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
    type ComponentAnnotations = Annotations<T, StoryFnReactReturnType> &
        Pick<BaseStory<any, any>, 'storyName'> & { children?: React.ReactNode }
    return {
        meta(meta: Meta<T>): Meta<T> {
            return { ...meta, component: Component }
        },
        of(annotations: ComponentAnnotations = {}) {
            const copy: Story<T> = (props: T) => <Component children={annotations.children} {...props} />
            Object.assign(copy, annotations)
            return copy
        },
    }
}
