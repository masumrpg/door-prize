import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Image, Loader2 } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

interface FormData {
    name: string;
    description: string;
    total_stock: number;
    image: File | null;
    is_active: boolean;
}

export default function PrizeCreate() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        description: '',
        total_stock: 1,
        image: null,
        is_active: true,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dasbor',
            href: '/dashboard',
        },
        {
            title: 'Hadiah',
            href: '/prizes',
        },
        {
            title: 'Buat Hadiah',
            href: '/prizes/create',
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/prizes', {
            onSuccess: () => {
                // Redirect is handled by the controller
            },
        });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('image', file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);

        // Reset the file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Hadiah" />
            <div className="p-4">
                <div className="flex items-center mb-6">
                    <Button variant="outline" size="sm" className="mr-4" asChild>
                        <a href="/prizes">
                            <ArrowLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <h1 className="text-2xl font-bold">Buat Hadiah Baru</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Hadiah</CardTitle>
                            <CardDescription>
                                Tambahkan hadiah baru untuk acara doorprize Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className={errors.name ? 'text-red-500' : ''}>
                                    Nama Hadiah *
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className={errors.description ? 'text-red-500' : ''}>
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-red-500' : ''}
                                    rows={3}
                                />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_stock" className={errors.total_stock ? 'text-red-500' : ''}>
                                    Total Stok *
                                </Label>
                                <Input
                                    id="total_stock"
                                    type="number"
                                    min="1"
                                    value={data.total_stock}
                                    onChange={(e) => setData('total_stock', parseInt(e.target.value) || 1)}
                                    className={errors.total_stock ? 'border-red-500' : ''}
                                />
                                {errors.total_stock && <p className="text-red-500 text-sm">{errors.total_stock}</p>}
                                <p className="text-sm text-gray-500">Jumlah total hadiah ini yang tersedia untuk pemenang.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image" className={errors.image ? 'text-red-500' : ''}>
                                    Gambar Hadiah
                                </Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 border">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Pratinjau hadiah"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Image className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className={errors.image ? 'border-red-500' : ''}
                                        />
                                        {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                                        <p className="text-sm text-gray-500 mt-1">
                                            Unggah gambar hadiah. Ukuran yang disarankan: 500x500px.
                                        </p>
                                        {imagePreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={removeImage}
                                                className="mt-2"
                                            >
                                                Hapus Gambar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="is_active" className="font-normal">
                                        Aktif
                                    </Label>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Hadiah aktif akan tersedia untuk dipilih selama acara doorprize.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" type="button" asChild>
                                <a href="/prizes">Batal</a>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Hadiah'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
