import Link from 'next/link';
import { Dumbbell, BookOpen, TrendingUp, Calendar, ArrowRight, Zap } from 'lucide-react';
import { getRecentLogs } from '@/lib/actions/workoutLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
  let recentLogs: Awaited<ReturnType<typeof getRecentLogs>> = [];
  let totalSessions = 0;

  try {
    recentLogs = await getRecentLogs(5);
    totalSessions = recentLogs.length;
  } catch {
    // MongoDB not connected yet — gracefully show empty state
  }

  const dayLabels = ['', 'Squat Day', 'Bench Day', 'Deadlift Day', 'Upper Accessory'];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-card to-card p-8">
        <div className="absolute -top-8 -right-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-widest">PowerTrack</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Your Training Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mb-6 max-w-xl">
            Track your 8-week powerlifting program, log every set, and watch your strength grow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/training">
                <Dumbbell className="h-4 w-4" />
                Log Today&apos;s Session
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="gap-2">
              <Link href="/exercises">
                <BookOpen className="h-4 w-4" />
                Exercise Database
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Sessions Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">All time sessions</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Program Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground mt-1">Weeks, 4 days/week</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Dumbbell className="h-4 w-4" /> Program Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">32</div>
            <p className="text-xs text-muted-foreground mt-1">Total training sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Sessions</h2>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Link href="/training">
              View Training <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {recentLogs.length === 0 ? (
          <Card className="border-dashed border-border bg-transparent">
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No sessions logged yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
                Add your MongoDB URI to <code className="bg-muted px-1 rounded text-xs">.env.local</code>, run the seed script, then log your first session.
              </p>
              <Button asChild size="sm">
                <Link href="/training">Start Training →</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Link
                key={log._id}
                href={`/training?week=${log.week}&day=${log.day}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-accent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary font-bold text-sm">
                    W{log.week}
                  </div>
                  <div>
                    <div className="font-medium text-sm">Week {log.week} — {dayLabels[log.day] ?? `Day ${log.day}`}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Day {log.day}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Start Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Start — Week 1</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((day) => (
            <Link
              key={day}
              href={`/training?week=1&day=${day}`}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-accent transition-all text-center"
            >
              <div className="text-2xl font-bold text-primary mb-1">D{day}</div>
              <div className="text-xs font-medium text-foreground">{dayLabels[day]}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Week 1</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
