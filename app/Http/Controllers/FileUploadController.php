<?php

namespace App\Http\Controllers;

use App\Models\FileUpload;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FileUploadController extends Controller
{
    public function index()
    {
        $uploads = FileUpload::where('user_id', Auth::id())
            ->latest()
            ->get();

         return inertia('features/FileUpload', [
            'uploads' => $uploads,
        ]);
    }

    public function initialize(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'filename' => 'required|string|max:255',
                'filesize' => 'required|integer|min:1',
                'total_chunks' => 'required|integer|min:1',
            ]);

            $upload = FileUpload::create([
                'user_id' => Auth::id(),
                'filename' => $validated['filename'],
                'filesize' => $validated['filesize'],
                'total_chunks' => $validated['total_chunks'],
            ]);

            $tempDir = storage_path("app/temp/{$upload->id}");
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            return response()->json([
                'upload_id' => $upload->id,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Initialize failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadChunk(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'upload_id' => 'required|exists:file_uploads,id',
                'chunk_number' => 'required|integer|min:0',
                'chunk' => 'required|file|max:5120',
            ]);

            $upload = FileUpload::findOrFail($validated['upload_id']);

            if ($upload->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $chunkFile = $request->file('chunk');

            if (!$chunkFile->isValid()) {
                return response()->json([
                    'message' => 'Invalid chunk file',
                    'error_code' => $chunkFile->getError()
                ], 422);
            }

            $tempDir = storage_path("app/temp/{$upload->id}");
            
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            $chunkPath = "{$tempDir}/chunk_{$validated['chunk_number']}";
            $content = file_get_contents($chunkFile->getRealPath());
            $result = file_put_contents($chunkPath, $content);

            if ($result === false || !file_exists($chunkPath)) {
                throw new \Exception('Failed to save chunk');
            }

            $upload->increment('uploaded_chunks');

            return response()->json([
                'success' => true,
                'uploaded_chunks' => $upload->uploaded_chunks,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function complete(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'upload_id' => 'required|exists:file_uploads,id',
            ]);

            $upload = FileUpload::findOrFail($request->upload_id);

            if ($upload->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($upload->uploaded_chunks !== $upload->total_chunks) {
                return response()->json([
                    'message' => 'Not all chunks uploaded',
                    'uploaded' => $upload->uploaded_chunks,
                    'total' => $upload->total_chunks
                ], 400);
            }

            $userFolder = storage_path("app/uploads/" . Auth::id());
            if (!file_exists($userFolder)) {
                mkdir($userFolder, 0755, true);
            }

            $finalPath = "uploads/" . Auth::id() . "/{$upload->id}_{$upload->filename}";
            $finalFilePath = storage_path("app/{$finalPath}");
            
            $finalFile = fopen($finalFilePath, 'wb');
            
            if (!$finalFile) {
                throw new \Exception('Failed to create final file');
            }

            $tempDir = storage_path("app/temp/{$upload->id}");

            for ($i = 0; $i < $upload->total_chunks; $i++) {
                $chunkPath = "{$tempDir}/chunk_{$i}";
                
                if (!file_exists($chunkPath)) {
                    fclose($finalFile);
                    
                    // List files in temp dir for debugging
                    $files = scandir($tempDir);
                    throw new \Exception("Chunk {$i} not found. Files in temp: " . implode(', ', $files));
                }
                
                $chunkFile = fopen($chunkPath, 'rb');
                
                if (!$chunkFile) {
                    fclose($finalFile);
                    throw new \Exception("Failed to read chunk {$i}");
                }
                
                stream_copy_to_stream($chunkFile, $finalFile);
                fclose($chunkFile);
                unlink($chunkPath);
            }

            fclose($finalFile);

            if (!file_exists($finalFilePath)) {
                throw new \Exception('Failed to save merged file');
            }

            if (file_exists($tempDir)) {
                rmdir($tempDir);
            }

            $upload->update([
                'path' => $finalPath,
                'status' => 'completed',
            ]);

            return response()->json([
                'success' => true,
                'path' => $finalPath,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Complete failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}