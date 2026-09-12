import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? 'reviewer@tempo.app';
  const password = process.env.DEMO_USER_PASSWORD ?? 'Review123!';
  const name = 'Demo Reviewer';

  console.log(`Seeding rich demo data for ${email}...`);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  });

  // Clear existing demo data for this user to recreate clean, rich dataset
  await prisma.activeTimer.deleteMany({ where: { userId: user.id } });
  await prisma.timeLog.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;

  // Helper for dates relative to now
  const daysAgo = (days: number, hours = 0, minutes = 0) =>
    new Date(now.getTime() - days * dayMs + hours * hourMs + minutes * minuteMs);
  const daysAhead = (days: number, hours = 0) =>
    new Date(now.getTime() + days * dayMs + hours * hourMs);

  // 1. Task: Active Focus & Review
  const taskActive = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Review productivity analytics & KPIs',
      title: 'Review productivity analytics & KPI widgets',
      description: 'Audit daily focus trends, task completion velocity, and weekly breakdown metrics for stakeholder review.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueAt: daysAhead(1, 4),
      reminderAt: daysAhead(0, 2),
      totalDurationSeconds: 7200,
      createdAt: daysAgo(3),
    },
  });

  // 2. Task: Critical Webhook Bug
  const taskUrgent = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'fix critical payment webhook retry loop',
      title: 'Fix critical payment webhook retry loop',
      description: 'Resolve idempotency issue causing duplicate webhook retries during Stripe payment confirmation.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueAt: daysAhead(0, 3), // Due today
      reminderAt: daysAhead(0, 1),
      totalDurationSeconds: 5400,
      createdAt: daysAgo(1),
    },
  });

  // 3. Task: OAuth Implementation
  const taskOAuth = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Implement Google & GitHub OAuth2 login',
      title: 'Implement Google & GitHub OAuth2 authentication',
      description: 'Configure Passport.js OAuth strategies, token refresh exchange, and user profile sync pipeline.',
      status: 'PENDING',
      priority: 'HIGH',
      dueAt: daysAhead(2),
      reminderAt: daysAhead(1, 2),
      totalDurationSeconds: 0,
      createdAt: daysAgo(2),
    },
  });

  // 4. Task: Postgres Optimization (Completed)
  const taskPostgres = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Optimize PostgreSQL connection pooling & indexes',
      title: 'Optimize PostgreSQL connection pooling & query indexes',
      description: 'Migrated datasource to Aiven PostgreSQL, added compound indexes for userId+status, and tuned pool limits.',
      status: 'COMPLETED',
      priority: 'HIGH',
      completedAt: daysAgo(1, -4),
      totalDurationSeconds: 10800,
      createdAt: daysAgo(4),
    },
  });

  // 5. Task: State Management Refactoring
  const taskState = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'refactor client controller hooks and stores',
      title: 'Refactor client controller hooks & state sync',
      description: 'Decouple view components from raw API calls, isolate optimistic timer state, and standardize error boundaries.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueAt: daysAhead(3),
      totalDurationSeconds: 9600,
      createdAt: daysAgo(5),
    },
  });

  // 6. Task: Production Hotfix (Completed)
  const taskHotfix = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Deploy v2.4 hotfix for session cookie domain',
      title: 'Deploy v2.4 hotfix for cross-domain cookie auth',
      description: 'Corrected SameSite=None and secure flags on production staging domain to fix mobile Safari logins.',
      status: 'COMPLETED',
      priority: 'URGENT',
      completedAt: daysAgo(0, -2), // Completed today
      totalDurationSeconds: 3600,
      createdAt: daysAgo(1),
    },
  });

  // 7. Task: Dark Mode Design System (Completed)
  const taskDesign = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Design glassmorphic dark mode theme tokens',
      title: 'Design glassmorphic dark-mode theme & tokens',
      description: 'Built curated HSL palette, card backdrop-filters, subtle glow animations, and WCAG AA contrast tokens.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      completedAt: daysAgo(2, -3),
      totalDurationSeconds: 14400,
      createdAt: daysAgo(6),
    },
  });

  // 8. Task: Cypress E2E Tests
  const taskTesting = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Write Cypress E2E tests for timer persistence',
      title: 'Write end-to-end Cypress test suite for timer workflows',
      description: 'Cover start/pause/stop lifecycle, page reloads during active timers, and manual log entry validation.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueAt: daysAhead(4),
      totalDurationSeconds: 4200,
      createdAt: daysAgo(3),
    },
  });

  // 9. Task: Swagger Documentation (Completed)
  const taskSwagger = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Update OpenAPI swagger docs',
      title: 'Update Swagger OpenAPI specs & DTO schemas',
      description: 'Documented all auth, task, time log, and analytics endpoints with sample responses and error codes.',
      status: 'COMPLETED',
      priority: 'LOW',
      completedAt: daysAgo(4, -5),
      totalDurationSeconds: 5400,
      createdAt: daysAgo(6),
    },
  });

  // 10. Task: Weekly Engineering Sync
  const taskSync = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Prepare weekly engineering sync deck',
      title: 'Prepare weekly engineering sync & roadmap deck',
      description: 'Outline sprint velocity, backend migration milestones, and upcoming timer push notification feature.',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueAt: daysAhead(2, 6),
      reminderAt: daysAhead(1, 8),
      totalDurationSeconds: 0,
      createdAt: daysAgo(1),
    },
  });

  // 11. Task: Push Notifications
  const taskPush = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Integrate Web Push API for reminder alerts',
      title: 'Integrate Web Push notifications for scheduled task reminders',
      description: 'Register service worker push listener and send desktop notifications when task reminderAt triggers.',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueAt: daysAhead(5),
      totalDurationSeconds: 0,
      createdAt: daysAgo(2),
    },
  });

  // 12. Task: Overdue Maintenance Task
  const taskOverdue = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Audit bundle size and tree-shaking exports',
      title: 'Audit client bundle size & tree-shaking exports',
      description: 'Analyze rollup bundle visualizer output, prune unused lodash imports, and enable dynamic imports for charts.',
      status: 'PENDING',
      priority: 'LOW',
      dueAt: daysAgo(1, 2), // Overdue!
      reminderAt: daysAgo(1, 0),
      totalDurationSeconds: 0,
      createdAt: daysAgo(5),
    },
  });

  // 13. Task: Quarterly Architecture Review (Completed)
  const taskReview = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Conduct quarterly system architecture review',
      title: 'Conduct quarterly system architecture & scalability review',
      description: 'Benchmarked throughput, evaluated read replicas for analytics queries, and planned modular service boundary.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      completedAt: daysAgo(5, -2),
      totalDurationSeconds: 12600,
      createdAt: daysAgo(7),
    },
  });

  // 14. Task: Deprecated Flags Cleanup (Completed)
  const taskFlags = await prisma.task.create({
    data: {
      userId: user.id,
      rawInput: 'Clean up legacy feature toggles',
      title: 'Prune deprecated feature toggles & dead code paths',
      description: 'Removed legacy v1 experimental timer hooks and unused CSS utility classes across components.',
      status: 'COMPLETED',
      priority: 'LOW',
      completedAt: daysAgo(6, -1),
      totalDurationSeconds: 3600,
      createdAt: daysAgo(7),
    },
  });

  // ==========================================
  // Time Logs Distributed Across Last 7 Days
  // ==========================================
  const logsData = [
    // Today (Day 0)
    {
      taskId: taskUrgent.id,
      startedAt: daysAgo(0, -4, 0),
      endedAt: daysAgo(0, -2, 30),
      durationSeconds: 5400, // 1.5h
      note: 'Traced webhook retry payload and added database transaction isolation',
    },
    {
      taskId: taskHotfix.id,
      startedAt: daysAgo(0, -6, 0),
      endedAt: daysAgo(0, -5, 0),
      durationSeconds: 3600, // 1h
      note: 'Verified cross-origin credentials and deployed patch to staging cluster',
    },
    {
      taskId: taskActive.id,
      startedAt: daysAgo(0, -1, 30),
      endedAt: daysAgo(0, -0, 30),
      durationSeconds: 3600, // 1h
      note: 'Audited daily summary response time and chart rendering performance',
    },

    // Yesterday (Day 1)
    {
      taskId: taskPostgres.id,
      startedAt: daysAgo(1, -7, 0),
      endedAt: daysAgo(1, -4, 0),
      durationSeconds: 10800, // 3h
      note: 'Configured Aiven PostgreSQL cluster, verified connection pooling, created indexes',
    },
    {
      taskId: taskState.id,
      startedAt: daysAgo(1, -3, 30),
      endedAt: daysAgo(1, -1, 30),
      durationSeconds: 7200, // 2h
      note: 'Refactored useTimer hook to sync cleanly with server timer state',
    },
    {
      taskId: taskTesting.id,
      startedAt: daysAgo(1, -1, 0),
      endedAt: daysAgo(1, 0, 10),
      durationSeconds: 4200, // 1.16h
      note: 'Wrote unit tests for reminder calculation logic and edge case handlers',
    },

    // 2 Days Ago (Day 2)
    {
      taskId: taskDesign.id,
      startedAt: daysAgo(2, -7, 0),
      endedAt: daysAgo(2, -3, 0),
      durationSeconds: 14400, // 4h
      note: 'Refined dark mode color palette, glow accents, and responsive layout grid',
    },
    {
      taskId: taskActive.id,
      startedAt: daysAgo(2, -2, 30),
      endedAt: daysAgo(2, -1, 30),
      durationSeconds: 3600, // 1h
      note: 'Designed productivity analytics dashboard layouts and summary cards',
    },

    // 3 Days Ago (Day 3 - Peak Productivity Day!)
    {
      taskId: taskState.id,
      startedAt: daysAgo(3, -8, 0),
      endedAt: daysAgo(3, -6, 0),
      durationSeconds: 2400,
      note: 'Mapped out state store architecture and event subscriptions',
    },
    {
      taskId: taskReview.id,
      startedAt: daysAgo(3, -5, 30),
      endedAt: daysAgo(3, -2, 0),
      durationSeconds: 12600, // 3.5h
      note: 'Benchmarked database read throughput under concurrent timer loads',
    },
    {
      taskId: taskSwagger.id,
      startedAt: daysAgo(3, -1, 30),
      endedAt: daysAgo(3, 0, 0),
      durationSeconds: 5400, // 1.5h
      note: 'Wrote OpenAPI schema documentation for all time log endpoints',
    },

    // 4 Days Ago (Day 4)
    {
      taskId: taskFlags.id,
      startedAt: daysAgo(4, -6, 0),
      endedAt: daysAgo(4, -5, 0),
      durationSeconds: 3600,
      note: 'Removed deprecated CSS rules and obsolete utility functions',
    },
    {
      taskId: taskDesign.id,
      startedAt: daysAgo(4, -4, 30),
      endedAt: daysAgo(4, -1, 30),
      durationSeconds: 10800,
      note: 'Created typography scale and glassmorphism panel styles',
    },

    // 5 Days Ago (Day 5)
    {
      taskId: taskPostgres.id,
      startedAt: daysAgo(5, -6, 0),
      endedAt: daysAgo(5, -3, 0),
      durationSeconds: 10800,
      note: 'Schema modeling for cascade deletes and compound index definitions',
    },
    {
      taskId: taskState.id,
      startedAt: daysAgo(5, -2, 0),
      endedAt: daysAgo(5, 0, 0),
      durationSeconds: 7200,
      note: 'Setup optimistic UI updates for task status transitions',
    },

    // 6 Days Ago (Day 6)
    {
      taskId: taskFlags.id,
      startedAt: daysAgo(6, -5, 0),
      endedAt: daysAgo(6, -3, 0),
      durationSeconds: 7200,
      note: 'Initial audit of legacy code and unused dependencies',
    },
  ];

  for (const log of logsData) {
    await prisma.timeLog.create({
      data: {
        userId: user.id,
        taskId: log.taskId,
        startedAt: log.startedAt,
        endedAt: log.endedAt,
        durationSeconds: log.durationSeconds,
        note: log.note,
      },
    });
  }

  // Active Live Running Timer on taskActive (started 28 minutes ago)
  await prisma.activeTimer.create({
    data: {
      userId: user.id,
      taskId: taskActive.id,
      startedAt: new Date(now.getTime() - 28 * minuteMs),
      note: 'Live Focus Session: Analyzing weekly trend charts & distribution',
    },
  });

  console.log(`✅ Seeded 14 realistic tasks across all priorities & statuses`);
  console.log(`✅ Seeded ${logsData.length} detailed time logs spanning the past 7 days`);
  console.log(`✅ Started 1 live active running timer`);
  console.log(`Demo login credentials: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
