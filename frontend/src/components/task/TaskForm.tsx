import { useState } from 'react';
import { BellRing, CalendarClock, LoaderCircle, Sparkles } from 'lucide-react';
import type { Priority, Status, Task, TaskInput } from '@/models';
import { workspaceService } from '@/services/workspace.service';
import { Icon } from '@/components/ui/Icon';

function toLocalInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function TaskForm({ task, onSubmit, onCancel }: { task?: Task; onSubmit(data: TaskInput): Promise<void>; onCancel(): void }) {
  const [rawInput, setRawInput] = useState(task?.rawInput ?? '');
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<Status>(task?.status ?? 'PENDING');
  const [dueAt, setDueAt] = useState(toLocalInput(task?.dueAt));
  const [reminderAt, setReminderAt] = useState(toLocalInput(task?.reminderAt));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function enhance() {
    if (rawInput.trim().length < 3) return setError('Add a little more detail first.');
    setBusy(true); setError('');
    try {
      const result = await workspaceService.enhance(rawInput);
      setTitle(result.title); setDescription(result.description); setPriority(result.priority);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not refine the task.');
    } finally { setBusy(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 2) return setError('A task title is required.');
    if (dueAt && reminderAt && new Date(reminderAt) > new Date(dueAt)) return setError('Reminder time must be before the due time.');
    setBusy(true); setError('');
    try {
      await onSubmit({
        title: title.trim(), description: description.trim(), rawInput: rawInput || undefined,
        priority, status,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
      });
    } catch { setBusy(false); }
  }

  return (
    <form className="task-form" onSubmit={submit}>
      {error && <div className="form-error" role="alert">{error}</div>}
      {!task && <label><span>Start with a thought <small>optional</small></span><div className="enhance-field"><input value={rawInput} onChange={(event) => setRawInput(event.target.value)} placeholder="e.g. follow up with designer tomorrow" maxLength={300} /><button className="secondary-button" type="button" onClick={enhance} disabled={busy}><Icon icon={busy ? LoaderCircle : Sparkles} />Refine</button></div></label>}
      <label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} /></label>
      <label><span>Description <small>optional</small></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={1000} placeholder="Add context or the expected outcome…" /></label>
      <div className="form-grid"><label><span>Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as Status)}><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label></div>
      <div className="schedule-fields">
        <label><span><Icon icon={CalendarClock} size={15} />Due date <small>optional</small></span><input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>
        <label><span><Icon icon={BellRing} size={15} />Remind me <small>optional</small></span><input type="datetime-local" value={reminderAt} onChange={(event) => setReminderAt(event.target.value)} /></label>
      </div>
      <p className="schedule-help">Reminders use your browser’s notification permission and this device’s local time.</p>
      <div className="modal-actions"><button type="button" className="ghost-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
    </form>
  );
}
