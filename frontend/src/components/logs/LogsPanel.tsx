import { Clock3, Trash2 } from 'lucide-react';
import type { TimeLog } from '@/models';
import { formatDuration } from '@/utils/format';
import { Icon } from '@/components/ui/Icon';

export function LogsPanel({ logs, onDelete }: { logs: TimeLog[]; onDelete(id: string): void }) {
  return <section className="surface logs-panel"><div className="section-heading"><div><span className="eyebrow">Session history</span><h2>Every focused interval</h2></div><span className="date-chip">Latest 100</span></div>{logs.length ? <div className="log-list">{logs.map((log) => <article className="log-row" key={log.id}><div className="log-symbol"><Icon icon={Clock3}/></div><div className="log-main"><strong>{log.task.title}</strong><span>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(log.startedAt))}</span></div><time>{formatDuration(log.durationSeconds)}</time><button className="icon-button danger" onClick={() => onDelete(log.id)} aria-label={`Delete time log for ${log.task.title}`}><Icon icon={Trash2} size={16}/></button></article>)}</div> : <div className="empty-state compact"><Clock3/><h3>No sessions recorded</h3><p>Finished timers will be kept here.</p></div>}</section>;
}
