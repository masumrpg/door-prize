import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Calendar, Users, Trophy } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Selamat Datang - Event Doorprize">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-gray-900 lg:justify-center lg:p-8 dark:from-gray-900 dark:to-gray-800 dark:text-white">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Button asChild variant="outline">
                                <Link href={route('dashboard')}>
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost">
                                    <Link href={route('login')}>
                                        Masuk
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={route('register')}>
                                        Daftar
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col lg:max-w-6xl lg:flex-row lg:gap-8">
                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            <div className="text-center lg:text-left">
                                <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-6xl">
                                    Selamat Datang di{' '}
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        Event Doorprize
                                    </span>
                                </h1>
                                <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 lg:text-xl">
                                    Platform terbaik untuk mengelola event dan doorprize Anda.
                                    Buat pengalaman yang tak terlupakan untuk peserta event.
                                </p>

                                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                                    <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                        <Link href={route('events.create')}>
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Buat Event Baru
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg">
                                        <Link href={route('events.index')}>
                                            <Gift className="mr-2 h-5 w-5" />
                                            Lihat Event
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Card className="border-purple-200 bg-white/50 backdrop-blur-sm dark:border-purple-800 dark:bg-gray-800/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <CardTitle className="text-lg">Kelola Event</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            Buat dan kelola event dengan mudah. Atur tanggal, waktu, dan detail event Anda.
                                        </CardDescription>
                                    </CardContent>
                                </Card>

                                <Card className="border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-800 dark:bg-gray-800/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                                <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <CardTitle className="text-lg">Doorprize</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            Atur doorprize dan hadiah menarik untuk peserta event Anda dengan sistem undian yang fair.
                                        </CardDescription>
                                    </CardContent>
                                </Card>

                                <Card className="border-green-200 bg-white/50 backdrop-blur-sm dark:border-green-800 dark:bg-gray-800/50 sm:col-span-2 lg:col-span-1">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <CardTitle className="text-lg">Peserta</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            Kelola data peserta dan pantau kehadiran event secara real-time.
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Right Side Illustration */}
                        <div className="mt-8 lg:mt-0 lg:w-[400px]">
                            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:border-orange-800 dark:from-orange-900/20 dark:to-red-900/20">
                                <CardContent className="p-8 text-center">
                                    <div className="mb-6 flex justify-center">
                                        <div className="rounded-full bg-gradient-to-r from-orange-400 to-red-400 p-6">
                                            <Trophy className="h-16 w-16 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                        Mulai Sekarang!
                                    </h3>
                                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                                        Buat event pertama Anda dan berikan pengalaman doorprize yang tak terlupakan untuk peserta.
                                    </p>
                                    <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                                        <Link href={route('events.create')}>
                                            <Gift className="mr-2 h-5 w-5" />
                                            Buat Event Pertama
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>

                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
