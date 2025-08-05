import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image, Video, FileText, Trash2, Copy, Search, Filter } from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  alt_text: string;
  caption: string;
  created_at: string;
}

export const MediaLibrary = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  useEffect(() => {
    filterMediaFiles();
  }, [mediaFiles, searchTerm, typeFilter]);

  const filterMediaFiles = () => {
    let filtered = [...mediaFiles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.alt_text && file.alt_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.caption && file.caption.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(file => {
        const category = getFileCategory(file.file_type);
        return category === typeFilter;
      });
    }

    setFilteredFiles(filtered);
  };

  const getFileCategory = (fileType: string): 'image' | 'video' | 'document' => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };

  const fetchMediaFiles = async () => {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch media files",
        variant: "destructive"
      });
    } else {
      setMediaFiles(data || []);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const file of selectedFiles) {
      try {
        // Determine bucket based on file type
        let bucket = 'cms-images';
        if (file.type.startsWith('video/')) {
          bucket = 'cms-videos';
        } else if (file.type === 'application/pdf' || 
                   file.type.includes('document') || 
                   file.type.includes('spreadsheet')) {
          bucket = 'cms-documents';
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Save to media library table
        const { error: dbError } = await supabase
          .from('media_library')
          .insert({
            filename: fileName,
            original_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: `${bucket}/${filePath}`,
            uploaded_by: user.id
          });

        if (dbError) {
          throw dbError;
        }

      } catch (error: any) {
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive"
        });
      }
    }

    setUploading(false);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Success",
      description: "Files uploaded successfully"
    });
    
    fetchMediaFiles();
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Are you sure you want to delete ${file.original_name}?`)) return;

    // Delete from storage
    const [bucket, ...pathParts] = file.storage_path.split('/');
    const filePath = pathParts.join('/');
    
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (storageError) {
      toast({
        title: "Error",
        description: "Failed to delete file from storage",
        variant: "destructive"
      });
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media_library')
      .delete()
      .eq('id', file.id);

    if (dbError) {
      toast({
        title: "Error",
        description: "Failed to delete file record",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
      fetchMediaFiles();
    }
  };

  const copyUrl = async (file: MediaFile) => {
    const [bucket, ...pathParts] = file.storage_path.split('/');
    const filePath = pathParts.join('/');
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    await navigator.clipboard.writeText(data.publicUrl);
    toast({
      title: "Copied",
      description: "File URL copied to clipboard"
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getFileUrl = (file: MediaFile) => {
    const [bucket, ...pathParts] = file.storage_path.split('/');
    const filePath = pathParts.join('/');
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-border rounded-lg p-8">
        <div className="text-center space-y-4">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <div>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-medium">Upload files</span>
              <p className="text-sm text-muted-foreground">
                Images, videos, and documents
              </p>
            </Label>
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {selectedFiles.length} file(s) selected
              </p>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter & Search Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="media-search">Search Files</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="media-search"
                  placeholder="Search by filename, alt text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="media-type-filter">Filter by Type</Label>
              <Select value={typeFilter} onValueChange={(value: 'all' | 'image' | 'video' | 'document') => setTypeFilter(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredFiles.length} of {mediaFiles.length} files
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No files found matching your filters.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredFiles.map((file) => (
          <Card key={file.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {file.file_type.startsWith('image/') ? (
                  <img
                    src={getFileUrl(file)}
                    alt={file.alt_text || file.original_name}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                    {getFileIcon(file.file_type)}
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-sm truncate" title={file.original_name}>
                    {file.original_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(file)}
                    className="flex-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};