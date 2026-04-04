import type { Activity } from '../types/activity';
import { SpamClassifierActivity } from '../activities/spam-classifier/SpamClassifierActivity';

/**
 * Activity Registry
 * 
 * To add a new activity, simply add a new entry to this array.
 * The component will be lazy-loaded and rendered when the user selects it.
 */
export const activities: Activity[] = [
  {
    id: 'spam-classifier',
    title: 'Real or Suspicious?',
    subtitle: 'Text Classification',
    description:
      'Sort messages, train a model, and learn how AI detects spam. Can you trick the machine?',
    icon: '🔍',
    gradient: 'linear-gradient(135deg, #7c5cfc, #00d4aa)',
    tags: ['text', 'classification', 'beginner'],
    component: SpamClassifierActivity,
  },
];
