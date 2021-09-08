import type { Annotations, BaseStory } from '@storybook/addons';
import type { StoryFnReactReturnType } from '@storybook/react/dist/ts3.9/client/preview/types';
import type { Meta } from '@storybook/react/types-6-0';
import React from 'react';
export declare type ComponentAnnotations<T> = Annotations<T, StoryFnReactReturnType> & Pick<BaseStory<any, any>, 'storyName'> & {
    children?: React.ReactNode;
};
export type { Story, Meta } from '@storybook/react/types-6-0';
/**
 * Create a typed story of a given component
 *
 * @example
 * const { meta, of } = story(Button)
 * export default meta({})
 * export const story1 = of({})
 * export const story2 = of({})
 */
export declare function story<T>(Component: React.ComponentType<T>): {
    meta(meta: Meta<T>): unknown;
    of(annotations?: ComponentAnnotations<T>): React.ComponentType<T>;
};
//# sourceMappingURL=story-of.d.ts.map