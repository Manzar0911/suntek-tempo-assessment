import { describe, expect, it } from 'vitest';
import { formatDuration, titleCase } from './format';
describe('formatDuration', () => { it('formats timer values', () => expect(formatDuration(3661)).toBe('01:01:01')); it('formats compact values', () => expect(formatDuration(3720, true)).toBe('1h 2m')); });
describe('titleCase', () => { it('formats enum labels', () => expect(titleCase('IN_PROGRESS')).toBe('In Progress')); });
