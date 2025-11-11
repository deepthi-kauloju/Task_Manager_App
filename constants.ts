

import { FilterType, SortType } from './types';

export const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
];

export const SORTS: { label: string; value: SortType }[] = [
  { label: 'Newest First', value: 'date-desc' },
  { label: 'Oldest First', value: 'date-asc' },
  { label: 'Due Date (Soonest)', value: 'due-date-asc' },
  { label: 'Due Date (Latest)', value: 'due-date-desc' },
];