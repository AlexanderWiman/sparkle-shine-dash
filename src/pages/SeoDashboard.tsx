import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MousePointerClick, Eye, Percent, TrendingUp } from "lucide-react";

const RANGES = [
  { label: "Senaste 7 dagarna", days: 7 },
  { label: "Senaste 28 dagarna", days: 28 },
  { label: "Senaste 90 dagarna", days: 90 },
];

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getRange(days: number) {
  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC has ~2 day lag
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

async function fetchGsc(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("gsc-analytics", { body });
  if (error) throw error;
  return data;
}

interface Row {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const SeoDashboard = () => {
  const [days, setDays] = useState(28);
  const range = useMemo(() => getRange(days), [days]);

  const totalsQ = useQuery({
    queryKey: ["gsc-totals", range],
    queryFn: () => fetchGsc({ ...range, dimensions: [], rowLimit: 1 }),
  });

  const dailyQ = useQuery({
    queryKey: ["gsc-daily", range],
    queryFn: () => fetchGsc({ ...range, dimensions: ["date"], rowLimit: 500 }),
  });

  const queriesQ = useQuery({
    queryKey: ["gsc-queries", range],
    queryFn: () => fetchGsc({ ...range, dimensions: ["query"], rowLimit: 25 }),
  });

  const pagesQ = useQuery({
    queryKey: ["gsc-pages", range],
    queryFn: () => fetchGsc({ ...range, dimensions: ["page"], rowLimit: 25 }),
  });

  const totals: Row | undefined = totalsQ.data?.rows?.[0];
  const dailyRows: Row[] = dailyQ.data?.rows ?? [];
  const queryRows: Row[] = queriesQ.data?.rows ?? [];
  const pageRows: Row[] = pagesQ.data?.rows ?? [];

  const chartData = dailyRows.map((r) => ({
    date: r.keys?.[0] ?? "",
    Klick: r.clicks,
    Visningar: r.impressions,
  }));

  const errorMsg = totalsQ.error || dailyQ.error || queriesQ.error || pagesQ.error;

  return (
    <Layout>
      <div className="p-2 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">SEO-dashboard</h1>
            <p className="text-sm text-muted-foreground">Google Search Console · carwashap.com</p>
          </div>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.days} value={String(r.days)}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {errorMsg && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-sm text-destructive">
              Kunde inte hämta GSC-data. Kontrollera Google Search Console-anslutningen.
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Klick" value={totals?.clicks} icon={MousePointerClick} loading={totalsQ.isLoading} />
          <MetricCard label="Visningar" value={totals?.impressions} icon={Eye} loading={totalsQ.isLoading} />
          <MetricCard label="CTR" value={totals ? `${(totals.ctr * 100).toFixed(2)}%` : undefined} icon={Percent} loading={totalsQ.isLoading} />
          <MetricCard label="Snittposition" value={totals ? totals.position.toFixed(1) : undefined} icon={TrendingUp} loading={totalsQ.isLoading} />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Trend</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {dailyQ.isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Klick" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Visningar" stroke="hsl(var(--muted-foreground))" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="queries">
          <TabsList>
            <TabsTrigger value="queries">Sökord</TabsTrigger>
            <TabsTrigger value="pages">Sidor</TabsTrigger>
          </TabsList>
          <TabsContent value="queries">
            <DataTable rows={queryRows} keyLabel="Sökord" loading={queriesQ.isLoading} />
          </TabsContent>
          <TabsContent value="pages">
            <DataTable rows={pageRows} keyLabel="Sida" loading={pagesQ.isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

function MetricCard({ label, value, icon: Icon, loading }: { label: string; value?: number | string; icon: React.ElementType; loading: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-20 mt-2" />
        ) : (
          <p className="text-2xl font-bold mt-1">{value ?? "—"}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DataTable({ rows, keyLabel, loading }: { rows: Row[]; keyLabel: string; loading: boolean }) {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (rows.length === 0) return <p className="text-sm text-muted-foreground p-4">Ingen data ännu.</p>;
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{keyLabel}</TableHead>
              <TableHead className="text-right">Klick</TableHead>
              <TableHead className="text-right">Visningar</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Pos.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="max-w-[300px] truncate">{r.keys?.[0]}</TableCell>
                <TableCell className="text-right">{r.clicks}</TableCell>
                <TableCell className="text-right">{r.impressions}</TableCell>
                <TableCell className="text-right">{(r.ctr * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">{r.position.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default SeoDashboard;
