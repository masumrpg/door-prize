import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, ChevronUp, ChevronDown, Users } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
        title: 'Dasbor',
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
        router.get(route('employees.index'), {
            search: kataPencarian,
            sortBy: urutkanBerdasarkan,
            sortOrder: urutanUrutan,
            perPage: perHalaman,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field: string): void => {
        const urutanBaru: 'asc' | 'desc' = urutkanBerdasarkan === field && urutanUrutan === 'asc' ? 'desc' : 'asc';
        setUrutkanBerdasarkan(field);
        setUrutanUrutan(urutanBaru);

        router.get(route('employees.index'), {
            search: kataPencarian,
            sortBy: field,
            sortOrder: urutanBaru,
            perPage: perHalaman,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (value: string): void => {
        const nilaiNumber = parseInt(value);
        setPerHalaman(nilaiNumber);
        router.get(route('employees.index'), {
            search: kataPencarian,
            sortBy: urutkanBerdasarkan,
            sortOrder: urutanUrutan,
            perPage: nilaiNumber,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const SortableHeader = ({ field, children }: SortableHeaderProps) => (
        <th
            className="cursor-pointer hover:bg-gray-50 select-none px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-2">
                {children}
                {urutkanBerdasarkan === field && (
                    urutanUrutan === 'asc' ?
                        <ChevronUp className="h-4 w-4" /> :
                        <ChevronDown className="h-4 w-4" />
                )}
            </div>
        </th>
    );

    const PaginationButton = ({ page, label, active = false, disabled = false }: PaginationButtonProps) => (
        <Button
            variant={active ? "default" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => {
                if (!disabled && !active && page) {
                    router.get(page, {
                        search: kataPencarian,
                        sortBy: urutkanBerdasarkan,
                        sortOrder: urutanUrutan,
                        perPage: perHalaman,
                    }, {
                        preserveState: true,
                        preserveScroll: true,
                    });
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
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div>
                                <CardTitle className="text-2xl">Karyawan</CardTitle>
                                <CardDescription>
                                    Kelola direktori karyawan Anda
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Pencarian dan Filter */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        <div className="mb-4 text-sm text-gray-600">
                            Menampilkan {employees.from || 0} sampai {employees.to || 0} dari {employees.total} karyawan
                        </div>

                        {/* Tabel */}
                        <div className="rounded-md border overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <SortableHeader field="employee_id">
                                        ID Karyawan
                                    </SortableHeader>
                                    <SortableHeader field="name">
                                        Nama
                                    </SortableHeader>
                                    <SortableHeader field="department">
                                        Departemen
                                    </SortableHeader>
                                    <SortableHeader field="position">
                                        Posisi
                                    </SortableHeader>
                                    <SortableHeader field="is_active">
                                        Status
                                    </SortableHeader>
                                    <SortableHeader field="created_at">
                                        Dibuat
                                    </SortableHeader>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {employees.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 px-4">
                                            <div className="text-gray-500">
                                                {kataPencarian ? 'Tidak ada karyawan yang ditemukan sesuai pencarian Anda.' : 'Tidak ada karyawan yang ditemukan.'}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    employees.data.map((employee: Employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {employee.employee_id}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {employee.name}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.department}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.position}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                <Badge variant={employee.is_active ? "default" : "secondary"}>
                                                    {employee.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(employee.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {employees.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-600">
                                    Halaman {employees.current_page} dari {employees.last_page}
                                </div>
                                <div className="flex items-center gap-2">
                                    <PaginationButton
                                        page={employees.first_page_url}
                                        label="Pertama"
                                        disabled={employees.current_page === 1}
                                    />
                                    <PaginationButton
                                        page={employees.prev_page_url}
                                        label="Sebelumnya"
                                        disabled={!employees.prev_page_url}
                                    />

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

                                    <PaginationButton
                                        page={employees.next_page_url}
                                        label="Selanjutnya"
                                        disabled={!employees.next_page_url}
                                    />
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
