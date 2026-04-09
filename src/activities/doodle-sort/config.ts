export type DoodleLabel = 'Circle' | 'Triangle' | 'Square' | 'Star';
export type DoodleDirection = 'up' | 'down' | 'left' | 'right';

export interface DoodleClassDefinition {
  label: DoodleLabel;
  icon: string;
  direction: DoodleDirection;
  color: string;
  arrowIcon: string;
  prompt: string;
  emptyHint: string;
}

export const MIN_DOODLES_PER_CLASS = 2;

export const DOODLE_CLASSES: DoodleClassDefinition[] = [
  {
    label: 'Square',
    icon: 'crop_square',
    direction: 'up',
    color: 'var(--doodle-launch-green)',
    arrowIcon: 'keyboard_arrow_up',
    prompt: 'Launch upward to file it as a square.',
    emptyHint: 'No squares sorted yet.',
  },
  {
    label: 'Circle',
    icon: 'panorama_fish_eye',
    direction: 'left',
    color: 'var(--doodle-launch-blue)',
    arrowIcon: 'keyboard_arrow_left',
    prompt: 'Send left if your doodle feels like a circle.',
    emptyHint: 'No circles sorted yet.',
  },
  {
    label: 'Triangle',
    icon: 'change_history',
    direction: 'right',
    color: 'var(--doodle-launch-amber)',
    arrowIcon: 'keyboard_arrow_right',
    prompt: 'Fling right when it belongs with triangles.',
    emptyHint: 'No triangles sorted yet.',
  },
  {
    label: 'Star',
    icon: 'star',
    direction: 'down',
    color: 'var(--doodle-launch-rose)',
    arrowIcon: 'keyboard_arrow_down',
    prompt: 'Drop downward if it shines like a star.',
    emptyHint: 'No stars sorted yet.',
  },
];

export const DOODLE_CLASS_MAP = Object.fromEntries(
  DOODLE_CLASSES.map((shape) => [shape.label, shape])
) as Record<DoodleLabel, DoodleClassDefinition>;
