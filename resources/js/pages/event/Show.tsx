import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarIcon, CheckCircle2, CircleDashed, Edit, Gift, RotateCcw, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
}

interface Prize {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  total_stock: number;
  remaining_stock: number;
}

interface Winner {
  id: number;
  employee: Employee;
  prize: Prize;
  winner_number: number;
  drawn_at: string;
}

interface DoorprizeEvent {
  id: number;
  name: string;
  description: string | null;
  event_date: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  winners: Winner[];
}

interface Props {
  event: DoorprizeEvent;
}

export default function EventShow({ event }: Props) {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Events',
      href: '/events',
    },
    {
      title: event.name,
      href: `/events/${event.id}`,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full"><CheckCircle2 className="w-3 h-3" /> Active</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full"><CircleDashed className="w-3 h-3" /> Draft</span>;
    }
  };

  const handleReset = () => {
    router.post(`/doorprize/reset`, {}, {
      onSuccess: () => {
        setResetDialogOpen(false);
        // Reload the page to get fresh data
        router.reload();
      }
    });
  };

  // Group winners by prize
  const winnersByPrize = event.winners.reduce((acc, winner) => {
    const prizeId = winner.prize.id;
    if (!acc[prizeId]) {
      acc[prizeId] = {
        prize: winner.prize,
        winners: []
      };
    }
    acc[prizeId].winners.push(winner);
    return acc;
  }, {} as Record<number, { prize: Prize, winners: Winner[] }>);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={event.name} />
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <a href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </a>
          </Button>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <div className="ml-4">{getStatusBadge(event.status)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Event Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Event Name</h3>
                  <p className="text-lg">{event.name}</p>
                </div>
                
                {event.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-base">{event.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Event Date</h3>
                  <p className="text-base">{formatDate(event.event_date)}</p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button asChild>
                    <Link href={`/events/${event.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Event
                    </Link>
                  </Button>
                  
                  {event.status === 'active' && (
                    <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset Winners
                    </Button>
                  )}
                  
                  {event.status === 'active' && (
                    <Button variant="outline" asChild>
                      <Link href="/doorprize">
                        <Gift className="mr-2 h-4 w-4" /> Go to Doorprize
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" /> Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Winners</h3>
                      <p className="text-2xl font-bold">{event.winners.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Gift className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Unique Prizes</h3>
                      <p className="text-2xl font-bold">{Object.keys(winnersByPrize).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Unique Winners</h3>
                      <p className="text-2xl font-bold">
                        {new Set(event.winners.map(w => w.employee.id)).size}
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
              <Trophy className="h-5 w-5" /> Winners
            </CardTitle>
            <CardDescription>
              All winners from this doorprize event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {event.winners.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No winners yet for this event.</p>
                {event.status === 'active' && (
                  <Button className="mt-4" asChild>
                    <Link href="/doorprize">
                      <Gift className="mr-2 h-4 w-4" /> Go to Doorprize
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.values(winnersByPrize).map(({ prize, winners }) => (
                  <div key={prize.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
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
                          <div className="text-2xl">🎁</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{prize.name}</h3>
                        <p className="text-sm text-gray-500">
                          {winners.length} winner{winners.length !== 1 ? 's' : ''}
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

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Winners</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all winners for this event? This will delete all winners and reset prize stock. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Winners
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}