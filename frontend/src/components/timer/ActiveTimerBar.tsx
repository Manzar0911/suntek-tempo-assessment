import { useEffect, useState } from 'react';
import { Square, Timer } from 'lucide-react';
import type { ActiveTimer } from '@/models';
import { formatDuration } from '@/utils/format';
import { Icon } from '@/components/ui/Icon';

export function ActiveTimerBar({ active, onStop }: { active: ActiveTimer | null; onStop(): void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (!active) return; const interval = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(interval); }, [active]);
  if (!active) return null;
  const seconds = Math.floor((now - new Date(active.startedAt).getTime()) / 1000);
  return <aside className="active-bar" aria-live="polite"><div className="active-pulse"><Icon icon={Timer} size={20} /></div><div className="active-copy"><span>Focus session</span><strong>{active.task.title}</strong></div><time>{formatDuration(seconds)}</time><button className="stop-button" onClick={onStop}><Icon icon={Square} size={15} />Stop</button></aside>;
}
