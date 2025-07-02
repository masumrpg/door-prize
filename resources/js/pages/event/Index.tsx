import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarIcon, CheckCircle2, CircleDashed, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DoorprizeEvent {
  id: number;
  name: string;
  description: string | null;
  event_date: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Props {
  events: DoorprizeEvent[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Events',
    href: '/events',
  },
];

export default function EventIndex({ events }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<DoorprizeEvent | null>(null);

  const confirmDelete = (event: DoorprizeEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (eventToDelete) {
      router.delete(`/events/${eventToDelete.id}`);
    }
    setDeleteDialogOpen(false);
  };

  const setActive = (event: DoorprizeEvent) => {
    router.post(`/events/${event.id}/set-active`);
  };

  const setCompleted = (event: DoorprizeEvent) => {
    router.post(`/events/${event.id}/set-completed`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Doorprize Events" />
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Doorprize Events</h1>
          <Button asChild>
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>Manage your doorprize events here.</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No events found. Create your first event!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <Link href={`/events/${event.id}`} className="hover:underline">
                          {event.name}
                        </Link>
                        {event.description && (
                          <p className="text-sm text-gray-500 truncate max-w-md">{event.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          {formatDate(event.event_date)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${event.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          {event.status !== 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setActive(event)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              Set Active
                            </Button>
                          )}
                          
                          {event.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setCompleted(event)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              Complete
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => confirmDelete(event)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the event "{eventToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}