import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, ChevronUp, ChevronDown, Users, Upload, X } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

// TypeScript interfaces
interface Employee {
    id: number;
    employee_id: string;
    name: string;
    department: string;
    position: string;
    is_active: boolean;
    created_at: string;
}

interface PaginatedEmployees {
    data: Employee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}

interface Filters {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    perPage?: number;
}

interface EmployeeIndexProps {
    employees: PaginatedEmployees;
    filters: Filters;
}

interface SortableHeaderProps {
    field: string;
    children: React.ReactNode;
}

interface PaginationButtonProps {
    page: string | null;
    label: string;
    active?: boolean;
    disabled?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Karyawan',
        href: '/employees',
    },
];

export default function EmployeeIndex({ employees, filters }: EmployeeIndexProps) {
    const [kataPencarian, setKataPencarian] = useState<string>(filters.search || '');
    const [urutkanBerdasarkan, setUrutkanBerdasarkan] = useState<string>(filters.sortBy || 'name');
    const [urutanUrutan, setUrutanUrutan] = useState<'asc' | 'desc'>(filters.sortOrder || 'asc');
    const [perHalaman, setPerHalaman] = useState<number>(filters.perPage || 10);
    const [showClearDialog, setShowClearDialog] = useState<boolean>(false);

    // States untuk import
    const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string>('');
    const [dragActive, setDragActive] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Debounce pencarian
    useEffect(() => {
        const timer = setTimeout(() => {
            if (kataPencarian !== filters.search) {
                handleFilter();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [kataPencarian]);

    const handleFilter = (): void => {
        router.get(
            route('employees.index'),
            {
                search: kataPencarian,
                sortBy: urutkanBerdasarkan,
                sortOrder: urutanUrutan,
                perPage: perHalaman,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSort = (field: string): void => {
        const urutanBaru: 'asc' | 'desc' = urutkanBerdasarkan === field && urutanUrutan === 'asc' ? 'desc' : 'asc';
        setUrutkanBerdasarkan(field);
        setUrutanUrutan(urutanBaru);

        router.get(
            route('employees.index'),
            {
                search: kataPencarian,
                sortBy: field,
                sortOrder: urutanBaru,
                perPage: perHalaman,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePerPageChange = (value: string): void => {
        const nilaiNumber = parseInt(value);
        setPerHalaman(nilaiNumber);
        router.get(
            route('employees.index'),
            {
                search: kataPencarian,
                sortBy: urutkanBerdasarkan,
                sortOrder: urutanUrutan,
                perPage: nilaiNumber,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Fungsi untuk handle drag and drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                setUploadError('');
            }
        }
    };

    const validateFile = (file: File): boolean => {
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];

        if (!allowedTypes.includes(file.type)) {
            setUploadError('Format file tidak didukung. Gunakan Excel (.xlsx, .xls) atau CSV.');
            return false;
        }

        if (file.size > 2 * 1024 * 1024) {
            // 2MB
            setUploadError('Ukuran file terlalu besar. Maksimal 2MB.');
            return false;
        }

        return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                setUploadError('');
            }
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Use router.post with proper promise handling
            router.post(route('employees.import'), formData, {
                forceFormData: true,
                preserveState: true,
                preserveScroll: false,
                onSuccess: () => {
                    // Close dialog and reset state
                    setShowImportDialog(false);
                    setSelectedFile(null);
                    setIsUploading(false);

                    // Reset file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }

                    // Optional: Show success message if available
                    console.log('Import successful');
                    toast.success('Import successful');
                },
                onError: (errors) => {
                    setIsUploading(false);
                    console.error('Import errors:', errors);
                    toast.error('Import errors');

                    // Handle specific error messages
                    if (errors.file) {
                        setUploadError(errors.file);
                    } else if (errors.message) {
                        setUploadError(errors.message);
                    } else {
                        setUploadError('Terjadi kesalahan saat upload');
                    }
                },
                onFinish: () => {
                    setIsUploading(false);
                },
            });
        } catch (error) {
            setIsUploading(false);
            setUploadError('Terjadi kesalahan saat upload');
            console.error('Upload error:', error);
        }
    };

    // const handleDownloadTemplate = () => {
    //     window.location.href = route('employees.template');
    // };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const SortableHeader = ({ field, children }: SortableHeaderProps) => (
        <th
            className="cursor-pointer border-b px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase select-none hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-2">
                {children}
                {urutkanBerdasarkan === field && (urutanUrutan === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
            </div>
        </th>
    );

    const PaginationButton = ({ page, label, active = false, disabled = false }: PaginationButtonProps) => (
        <Button
            variant={active ? 'default' : 'outline'}
            size="sm"
            disabled={disabled}
            onClick={() => {
                if (!disabled && !active && page) {
                    router.get(
                        page,
                        {
                            search: kataPencarian,
                            sortBy: urutkanBerdasarkan,
                            sortOrder: urutanUrutan,
                            perPage: perHalaman,
                        },
                        {
                            preserveState: true,
                            preserveScroll: true,
                        },
                    );
                }
            }}
        >
            {label}
        </Button>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Karyawan" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-black dark:text-white" />
                                <div>
                                    <CardTitle className="text-2xl">Karyawan</CardTitle>
                                    <CardDescription>Kelola direktori karyawan Anda</CardDescription>
                                </div>
                            </div>

                            <div className="items-center space-x-6">
                                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="gap-2">
                                            Hapus Semua Data Karyawan
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Konfirmasi Hapus Semua Data</DialogTitle>
                                            <DialogDescription>
                                                Tindakan ini akan menghapus <strong>seluruh data karyawan</strong> secara permanen. Proses ini tidak
                                                bisa dibatalkan. Apakah Anda yakin?
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                                                Batal
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    router.delete(route('employees.clear'), {
                                                        onSuccess: () => {
                                                            toast.success('Semua data berhasil dihapus!');
                                                            setShowClearDialog(false);
                                                        },
                                                        onError: () => {
                                                            toast.error('Gagal menghapus data.');
                                                        },
                                                    });
                                                }}
                                            >
                                                Ya, Hapus Semua
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Upload className="h-4 w-4" />
                                            Import Excel
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Import Data Karyawan</DialogTitle>
                                            <DialogDescription>
                                                Upload file Excel dengan 2 kolom: "Nomor" (employee_id) dan "Nama". Kedua kolom wajib diisi.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                            {/* Download Template Button */}
                                            {/*<div className="flex justify-center">*/}
                                            {/*    <Button*/}
                                            {/*        variant="outline"*/}
                                            {/*        size="sm"*/}
                                            {/*        onClick={handleDownloadTemplate}*/}
                                            {/*        className="gap-2"*/}
                                            {/*    >*/}
                                            {/*        <Download className="h-4 w-4" />*/}
                                            {/*        Download Template*/}
                                            {/*    </Button>*/}
                                            {/*</div>*/}

                                            {/* File Format Info */}
                                            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                                    <div className="mb-1 font-medium">Format File (2 Kolom):</div>
                                                    <div className="space-y-1">
                                                        <div>• Kolom 1: Nomor</div>
                                                        <div>• Kolom 2: Nama</div>
                                                        <div>• Kedua kolom harus diisi</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* File Upload Area */}
                                            <div
                                                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                                    dragActive
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                            >
                                                {selectedFile ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                                            <span className="text-sm font-medium">{selectedFile.name}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={removeFile}
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                                            Drag & drop file Excel di sini, atau{' '}
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                browse
                                                            </button>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Mendukung .xlsx, .xls, .csv (max 2MB)
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />

                                            {uploadError && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{uploadError}</AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                                                    Batal
                                                </Button>
                                                <Button onClick={handleImport} disabled={!selectedFile || isUploading}>
                                                    {isUploading ? 'Mengupload...' : 'Import'}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Pencarian dan Filter */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder="Cari karyawan..."
                                    value={kataPencarian}
                                    onChange={(e) => setKataPencarian(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={perHalaman.toString()} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 per halaman</SelectItem>
                                    <SelectItem value="25">25 per halaman</SelectItem>
                                    <SelectItem value="50">50 per halaman</SelectItem>
                                    <SelectItem value="100">100 per halaman</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ringkasan Hasil */}
                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan {employees.from || 0} sampai {employees.to || 0} dari {employees.total} karyawan
                        </div>

                        {/* Tabel */}
                        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <SortableHeader field="employee_id">Nomor Karyawan</SortableHeader>
                                    <SortableHeader field="name">Nama</SortableHeader>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                {employees.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                {kataPencarian
                                                    ? 'Tidak ada karyawan yang ditemukan sesuai pencarian Anda.'
                                                    : 'Tidak ada karyawan yang ditemukan.'}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    employees.data.map((employee: Employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                {employee.employee_id || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                {employee.name || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {employees.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Halaman {employees.current_page} dari {employees.last_page}
                                </div>
                                <div className="flex items-center gap-2">
                                    <PaginationButton page={employees.first_page_url} label="Pertama" disabled={employees.current_page === 1} />
                                    <PaginationButton page={employees.prev_page_url} label="Sebelumnya" disabled={!employees.prev_page_url} />

                                    {/* Nomor halaman */}
                                    {Array.from({ length: Math.min(5, employees.last_page) }, (_, i) => {
                                        const startPage = Math.max(1, employees.current_page - 2);
                                        const page = startPage + i;

                                        if (page <= employees.last_page) {
                                            return (
                                                <PaginationButton
                                                    key={page}
                                                    page={`${employees.path}?page=${page}`}
                                                    label={page.toString()}
                                                    active={page === employees.current_page}
                                                />
                                            );
                                        }
                                        return null;
                                    })}

                                    <PaginationButton page={employees.next_page_url} label="Selanjutnya" disabled={!employees.next_page_url} />
                                    <PaginationButton
                                        page={employees.last_page_url}
                                        label="Terakhir"
                                        disabled={employees.current_page === employees.last_page}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
