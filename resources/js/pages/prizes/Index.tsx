import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Gift, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
}

interface Props {
  prizes: Prize[];
}

export default function PrizeIndex({ prizes }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prizeToDelete, setPrizeToDelete] = useState<Prize | null>(null);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Prizes',
      href: '/prizes',
    },
  ];

  const confirmDelete = (prize: Prize) => {
    setPrizeToDelete(prize);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (prizeToDelete) {
      router.delete(`/prizes/${prizeToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPrizeToDelete(null);
        }
      });
    }
  };

  const toggleActive = (prize: Prize) => {
    router.post(`/prizes/${prize.id}/toggle-active`, {}, {
      preserveScroll: true,
    });
  };

  return (
      <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="Hadiah" />
          <div className="p-4">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                          <CardTitle className="text-2xl">Hadiah</CardTitle>
                          <CardDescription>
                              Kelola item doorprize untuk acara Anda.
                          </CardDescription>
                      </div>
                      <Button asChild>
                          <Link href="/prizes/create">
                              <Plus className="mr-2 h-4 w-4" /> Tambah Hadiah
                          </Link>
                      </Button>
                  </CardHeader>
                  <CardContent>
                      {prizes.length === 0 ? (
                          <div className="text-center py-8">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                  <Gift className="h-8 w-8 text-gray-500" />
                              </div>
                              <h3 className="text-lg font-medium mb-2">Belum ada hadiah</h3>
                              <p className="text-gray-500 mb-4">Mulai dengan menambahkan hadiah pertama Anda.</p>
                              <Button asChild>
                                  <Link href="/prizes/create">
                                      <Plus className="mr-2 h-4 w-4" /> Tambah Hadiah
                                  </Link>
                              </Button>
                          </div>
                      ) : (
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Gambar</TableHead>
                                      <TableHead>Nama</TableHead>
                                      <TableHead>Stok</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Aksi</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {prizes.map((prize) => (
                                      <TableRow key={prize.id}>
                                          <TableCell>
                                              <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
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
                                          </TableCell>
                                          <TableCell>
                                              <div className="font-medium">{prize.name}</div>
                                              {prize.description && (
                                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                                      {prize.description}
                                                  </div>
                                              )}
                                          </TableCell>
                                          <TableCell>
                                              <div className="flex flex-col">
                                                  <span className="font-medium">{prize.remaining_stock} / {prize.total_stock}</span>
                                                  <span className="text-xs text-gray-500">tersisa</span>
                                              </div>
                                          </TableCell>
                                          <TableCell>
                                              <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => toggleActive(prize)}
                                                  className={prize.is_active ? 'text-green-600' : 'text-gray-500'}
                                              >
                                                  {prize.is_active ? (
                                                      <>
                                                          <ToggleRight className="mr-2 h-4 w-4" />
                                                          Aktif
                                                      </>
                                                  ) : (
                                                      <>
                                                          <ToggleLeft className="mr-2 h-4 w-4" />
                                                          Tidak Aktif
                                                      </>
                                                  )}
                                              </Button>
                                          </TableCell>
                                          <TableCell className="text-right">
                                              <div className="flex justify-end space-x-2">
                                                  <Button variant="ghost" size="icon" asChild>
                                                      <Link href={`/prizes/${prize.id}/edit`}>
                                                          <Edit className="h-4 w-4" />
                                                          <span className="sr-only">Edit</span>
                                                      </Link>
                                                  </Button>
                                                  <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => confirmDelete(prize)}
                                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                  >
                                                      <Trash2 className="h-4 w-4" />
                                                      <span className="sr-only">Hapus</span>
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
                      <DialogTitle>Hapus Hadiah</DialogTitle>
                      <DialogDescription>
                          Apakah Anda yakin ingin menghapus "{prizeToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
                          {prizeToDelete && prizeToDelete.total_stock !== prizeToDelete.remaining_stock && (
                              <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded-md">
                                  Peringatan: Hadiah ini telah diberikan kepada pemenang. Menghapusnya dapat mempengaruhi data historis.
                              </div>
                          )}
                      </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                          Batal
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                          Hapus Hadiah
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </AppLayout>
  );
}
