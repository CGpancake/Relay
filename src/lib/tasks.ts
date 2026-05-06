import type { Task } from '../types';

export const progressFor = (task: Task) => {
  const done = task.subtasks.filter((subtask) => subtask.done).length;
  return { done, total: task.subtasks.length };
};
