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

interface FormData {
  name: string;
  description: string;
  total_stock: number;
  image: File | null;
  _method: string;
  is_active: boolean;
  remove_image: boolean;
}

interface Props {
  prize: Prize;
}

export default function PrizeEdit({ prize }: Props) {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: prize.name,
    description: prize.description || '',
    total_stock: prize.total_stock,
    image: null,
    _method: 'put',
    is_active: prize.is_active,
    remove_image: false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(prize.image_url);
  
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
      title: 'Edit Prize',
      href: `/prizes/${prize.id}/edit`,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/prizes/${prize.id}`, {
      onSuccess: () => {
        // Redirect is handled by the controller
      },
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData('image', file);
      setData('remove_image', false);
      
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
    setData('remove_image', true);
    setImagePreview(null);
    
    // Reset the file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Prize: ${prize.name}`} />
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <a href="/prizes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Prizes
            </a>
          </Button>
          <h1 className="text-2xl font-bold">Edit Prize</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Prize Details</CardTitle>
              <CardDescription>
                Edit the prize information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={errors.name ? 'text-red-500' : ''}>
                  Prize Name *
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
                  Description
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
                  Total Stock *
                </Label>
                <Input
                  id="total_stock"
                  type="number"
                  min={prize.remaining_stock}
                  value={data.total_stock}
                  onChange={(e) => setData('total_stock', parseInt(e.target.value) || prize.remaining_stock)}
                  className={errors.total_stock ? 'border-red-500' : ''}
                />
                {errors.total_stock && <p className="text-red-500 text-sm">{errors.total_stock}</p>}
                <p className="text-sm text-gray-500">
                  The total number of this prize available for winners. 
                  {prize.remaining_stock > 0 && (
                    <span className="text-amber-600"> Minimum value: {prize.remaining_stock} (currently remaining)</span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className={errors.image ? 'text-red-500' : ''}>
                  Prize Image
                </Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 border">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Prize preview"
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
                      Upload a new image to replace the current one. Recommended size: 500x500px.
                    </p>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="mt-2"
                      >
                        Remove Image
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
                    Active
                  </Label>
                </div>
                <p className="text-sm text-gray-500">
                  Active prizes will be available for selection during doorprize events.
                </p>
              </div>

              {prize.remaining_stock < prize.total_stock && (
                <div className="p-4 bg-amber-50 rounded-md">
                  <p className="text-amber-800 text-sm">
                    <strong>Note:</strong> This prize has been awarded to {prize.total_stock - prize.remaining_stock} winner(s).
                    Some changes may affect historical data.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <a href="/prizes">Cancel</a>
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}