import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, Upload } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

import { CheckmarkSquare01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface FileUploadData {
    id: number;
    filename: string;
    filesize: number;
    status: string;
}

interface Props {
    uploads: FileUploadData[];
}

export default function FileUploadIndex({ uploads }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const CHUNK_SIZE = 2 * 1024 * 1024; // 5MB

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const uploadFile = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsUploading(true);
        setProgress(0);

        try {
            const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);

            // 1. Initialize upload
            const { data: initData } = await axios.post('/upload/initialize', {
                filename: selectedFile.name,
                filesize: selectedFile.size,
                total_chunks: totalChunks,
            });

            const uploadId = initData.upload_id;

            // 2. Upload chunks
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
                const chunk = selectedFile.slice(start, end);

                const formData = new FormData();
                formData.append('upload_id', uploadId.toString());
                formData.append('chunk_number', i.toString());
                formData.append('chunk', chunk);

                await axios.post('/upload/chunk', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Update progress
                const currentProgress = Math.round(
                    ((i + 1) / totalChunks) * 100,
                );
                setProgress(currentProgress);
            }

            // 3. Complete upload
            await axios.post('/upload/complete', {
                upload_id: uploadId,
            });

            // Reset form
            setSelectedFile(null);
            setProgress(0);

            // Reload to show new upload
            router.reload();
        } catch (error) {
            console.error('Upload error:', error);
            if (axios.isAxiosError(error)) {
                alert(
                    `Upload failed: ${error.response?.data?.message || error.message}`,
                );
            } else {
                alert('Upload failed!');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const formatSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <AppLayout>
            <Head title="Upload File" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="mt-2">
                    <h1 className="text-3xl font-bold">Upload File Besar</h1>
                    <p className="text-muted-foreground">
                        Upload dengan chunking method
                    </p>
                </div>

                <Card className="rounded-2xl shadow-none">
                    <CardHeader>
                        <CardTitle>Upload File</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={uploadFile} className="space-y-4">
                            <div>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
                                />
                            </div>

                            {selectedFile && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedFile.name} (
                                    {formatSize(selectedFile.size)})
                                </p>
                            )}

                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Uploading...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={!selectedFile || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History */}
                {uploads.length > 0 && (
                    <div>
                        <p className="text-lg font-medium text-foreground">
                            Riwayat Upload
                        </p>

                        <div className="mt-2 space-y-2">
                            {uploads.map((upload) => (
                                <div
                                    key={upload.id}
                                    className="flex justify-between rounded-lg bg-gray-50 p-3"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {upload.filename}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatSize(upload.filesize)}
                                        </p>
                                    </div>
                                    <span className="text-sm text-green-600">
                                        <HugeiconsIcon
                                            icon={CheckmarkSquare01Icon}
                                            size={24}
                                            color="currentColor"
                                        />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
