import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarIcon, Edit, Gift, Package, Users } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
}

interface DoorprizeEvent {
  id: number;
  name: string;
  event_date: string;
}

interface Winner {
  id: number;
  employee: Employee;
  doorprize_event: DoorprizeEvent;
  winner_number: number;
  drawn_at: string;
}

interface Prize {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  total_stock: number;
  remaining_stock: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  winners: Winner[];
}

interface Props {
  prize: Prize;
}

export default function PrizeShow({ prize }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Prizes',
      href: '/prizes',
    },
    {
      title: prize.name,
      href: `/prizes/${prize.id}`,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group winners by event
  const winnersByEvent = prize.winners.reduce((acc, winner) => {
    const eventId = winner.doorprize_event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: winner.doorprize_event,
        winners: []
      };
    }
    acc[eventId].winners.push(winner);
    return acc;
  }, {} as Record<number, { event: DoorprizeEvent, winners: Winner[] }>);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={prize.name} />
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <a href="/prizes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Prizes
            </a>
          </Button>
          <h1 className="text-2xl font-bold">{prize.name}</h1>
          <div className="ml-4">
            {prize.is_active ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                Inactive
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Prize Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" /> Prize Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 border flex-shrink-0">
                  {prize.image_url ? (
                    <img
                      src={prize.image_url}
                      alt={prize.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🎁</div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="text-4xl">🎁</div>
                  )}
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prize Name</h3>
                    <p className="text-lg">{prize.name}</p>
                  </div>
                  
                  {prize.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="text-base">{prize.description}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Stock</h3>
                      <p className="text-base">{prize.total_stock}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Remaining Stock</h3>
                      <p className="text-base">{prize.remaining_stock}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Awarded</h3>
                      <p className="text-base">{prize.total_stock - prize.remaining_stock}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button asChild>
                      <Link href={`/prizes/${prize.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Prize
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Winners</h3>
                      <p className="text-2xl font-bold">{prize.winners.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Events</h3>
                      <p className="text-2xl font-bold">{Object.keys(winnersByEvent).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-purple-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Stock Status</h3>
                      <p className="text-xl font-bold">
                        {prize.remaining_stock} / {prize.total_stock}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winners Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Winners
            </CardTitle>
            <CardDescription>
              All winners who received this prize across different events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prize.winners.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No winners yet for this prize.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.values(winnersByEvent).map(({ event, winners }) => (
                  <div key={event.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          <Link href={`/events/${event.id}`} className="hover:underline">
                            {event.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(event.event_date)} • {winners.length} winner{winners.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Drawn At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {winners.map((winner) => (
                          <TableRow key={winner.id}>
                            <TableCell className="font-medium">#{winner.winner_number}</TableCell>
                            <TableCell>{winner.employee.name}</TableCell>
                            <TableCell>{winner.employee.department}</TableCell>
                            <TableCell>{winner.employee.position}</TableCell>
                            <TableCell>{formatDateTime(winner.drawn_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}