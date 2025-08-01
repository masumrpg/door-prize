import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
    },
    {
        title: 'Acara',
        href: '/events',
    },
    {
        title: 'Buat',
        href: '/events/create',
    },
];

export default function EventCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0], // Tanggal hari ini dalam format YYYY-MM-DD
        status: 'draft',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/events');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Acara Doorprize" />
            <div className="p-4">
                <div className="flex items-center mb-6">
                    <Button variant="outline" size="sm" className="mr-4" asChild>
                        <a href="/events">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <h1 className="text-2xl font-bold">Buat Acara Doorprize</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Acara</CardTitle>
                            <CardDescription>Buat acara doorprize baru.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Acara <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama acara"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <textarea
                                    id="description"
                                    className="border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Masukkan deskripsi acara"
                                    rows={4}
                                />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="event_date">Tanggal Acara <span className="text-red-500">*</span></Label>
                                <Input
                                    id="event_date"
                                    type="date"
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                />
                                {errors.event_date && <p className="text-red-500 text-sm">{errors.event_date}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: 'draft' | 'active' | 'completed') => setData('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draf</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="submit" disabled={processing} className={'hover:cursor-pointer'}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Acara'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
