import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { fetchBookings } from "@/lib/bookingApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Repeat, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  email: string;
  name: string;
  phone: string;
  bookingsCount: number;
  totalSpent: number;
  lastBooking: string;
  firstBooking: string;
}

const isInternal = (b: { customerName: string; vehicleRegistration: string }) =>
  b.customerName === "HALL STÄNGD" ||
  b.customerName === "Blockerad" ||
  b.vehicleRegistration === "BLOCKED";

const formatDate = (d: string) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("sv-SE");
  } catch {
    return d;
  }
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const bookings = await fetchBookings();
        const map = new Map<string, Customer>();
        for (const b of bookings) {
          if (isInternal(b)) continue;
          if (!b.email) continue;
          const key = b.email.trim().toLowerCase();
          const existing = map.get(key);
          const paid = b.status === "paid" || b.status === "completed";
          if (existing) {
            existing.bookingsCount += 1;
            if (paid) existing.totalSpent += b.totalPrice || 0;
            if (b.date > existing.lastBooking) {
              existing.lastBooking = b.date;
              existing.name = b.customerName || existing.name;
              existing.phone = b.phone || existing.phone;
            }
            if (b.date < existing.firstBooking) existing.firstBooking = b.date;
          } else {
            map.set(key, {
              email: key,
              name: b.customerName || "-",
              phone: b.phone || "-",
              bookingsCount: 1,
              totalSpent: paid ? b.totalPrice || 0 : 0,
              lastBooking: b.date,
              firstBooking: b.date,
            });
          }
        }
        const list = Array.from(map.values()).sort(
          (a, b) => b.bookingsCount - a.bookingsCount || b.lastBooking.localeCompare(a.lastBooking)
        );
        setCustomers(list);
      } catch (e) {
        console.error(e);
        toast.error("Kunde inte ladda kunder");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.email.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const returning = useMemo(() => filtered.filter((c) => c.bookingsCount > 1), [filtered]);

  const stats = useMemo(() => {
    const total = customers.length;
    const ret = customers.filter((c) => c.bookingsCount > 1).length;
    const rate = total ? Math.round((ret / total) * 100) : 0;
    return { total, ret, rate };
  }, [customers]);

  const renderTable = (rows: Customer[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kund</TableHead>
            <TableHead>E-post</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead className="text-right">Bokningar</TableHead>
            <TableHead className="text-right">Spenderat</TableHead>
            <TableHead>Första</TableHead>
            <TableHead>Senaste</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Inga kunder hittades
              </TableCell>
            </TableRow>
          ) : (
            rows.map((c) => (
              <TableRow key={c.email}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {c.name}
                    {c.bookingsCount > 1 && (
                      <Badge variant="secondary" className="gap-1">
                        <Repeat className="h-3 w-3" />
                        Återkommande
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell className="text-right font-semibold">{c.bookingsCount}</TableCell>
                <TableCell className="text-right">{c.totalSpent.toLocaleString("sv-SE")} kr</TableCell>
                <TableCell>{formatDate(c.firstBooking)}</TableCell>
                <TableCell>{formatDate(c.lastBooking)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background p-2 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Kunder</h1>
            <p className="text-muted-foreground">Översikt över alla kunder som har bokat</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Totalt antal kunder</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "-" : stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Återkommande</CardTitle>
                <Repeat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "-" : stats.ret}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Återkomstgrad</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "-" : `${stats.rate}%`}</div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök på namn, e-post eller telefon"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Alla kunder ({filtered.length})</TabsTrigger>
                <TabsTrigger value="returning">Återkommande ({returning.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Card>
                  <CardContent className="p-0">{renderTable(filtered)}</CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="returning" className="mt-4">
                <Card>
                  <CardContent className="p-0">{renderTable(returning)}</CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
