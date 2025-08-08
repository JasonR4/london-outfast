import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Eye, Trash2, Save, X, Upload, Image as ImageIcon, FileText, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  meta_title: string;
  meta_description: string;
  cover_image_url: string;
  reading_time: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  alt_text: string;
  caption: string;
  created_at: string;
}

export const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [selectedCoverField, setSelectedCoverField] = useState<'new' | 'edit'>('new');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: { text: '', blocks: [] },
    status: 'draft',
    meta_title: '',
    meta_description: '',
    cover_image_url: ''
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchMediaFiles();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error fetching media files:', error);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cms-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cms-images')
        .getPublicUrl(filePath);

      // Save to media library
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_library')
        .insert([{
          filename: fileName,
          original_name: file.name,
          storage_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id,
          alt_text: '',
          caption: ''
        }])
        .select()
        .single();

      if (mediaError) throw mediaError;

      // Update media files list
      setMediaFiles([mediaData, ...mediaFiles]);

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const publicUrl = await uploadFile(file);
    if (publicUrl) {
      if (selectedCoverField === 'new') {
        setNewPost({ ...newPost, cover_image_url: publicUrl });
      } else if (editingPost) {
        setEditingPost({ ...editingPost, cover_image_url: publicUrl });
      }
      setShowMediaDialog(false);
    }
  };

  const selectMediaFile = (file: MediaFile) => {
    const { data: { publicUrl } } = supabase.storage
      .from('cms-images')
      .getPublicUrl(file.storage_path);

    if (selectedCoverField === 'new') {
      setNewPost({ ...newPost, cover_image_url: publicUrl });
    } else if (editingPost) {
      setEditingPost({ ...editingPost, cover_image_url: publicUrl });
    }
    setShowMediaDialog(false);
  };

  const createPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...newPost,
          author_id: user.id,
          published_at: newPost.status === 'published' ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      setNewPost({
        title: '',
        slug: '',
        excerpt: '',
        content: { text: '', blocks: [] },
        status: 'draft',
        meta_title: '',
        meta_description: '',
        cover_image_url: ''
      });

      toast({
        title: "Success",
        description: "Blog post created successfully"
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive"
      });
    }
  };

  const updatePost = async (post: BlogPost) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          status: post.status,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          cover_image_url: post.cover_image_url,
          published_at: post.status === 'published' && !post.published_at ? new Date().toISOString() : post.published_at
        })
        .eq('id', post.id)
        .select()
        .single();

      if (error) throw error;

      setPosts(posts.map(p => p.id === post.id ? data : p));
      setEditingPost(null);

      toast({
        title: "Success",
        description: "Blog post updated successfully"
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Blog post deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive"
      });
    }
  };

  const createCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setNewCategory({ name: '', slug: '', description: '' });

      toast({
        title: "Success",
        description: "Category created successfully"
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading blog management...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* Media Upload Dialog */}
          <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select or Upload Media</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upload New File</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Supports images, videos, and documents
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Media Gallery */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Media Library ({mediaFiles.length} files)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {mediaFiles.map((file) => {
                        // Generate public URL with error handling
                        const getImageUrl = () => {
                          try {
                            const { data } = supabase.storage
                              .from('cms-images')
                              .getPublicUrl(file.storage_path);
                            return data.publicUrl;
                          } catch (error) {
                            console.error('Error generating public URL:', error);
                            return '';
                          }
                        };

                        const imageUrl = getImageUrl();

                        return (
                          <div
                            key={file.id}
                            className="border rounded-lg p-2 cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => selectMediaFile(file)}
                          >
                            {file.file_type.startsWith('image/') ? (
                              <div className="relative">
                                <img
                                  src={imageUrl}
                                  alt={file.alt_text || file.original_name}
                                  className="w-full h-24 object-cover rounded mb-2"
                                  onError={(e) => {
                                    console.error('Failed to load image:', imageUrl);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully:', imageUrl);
                                  }}
                                />
                                <div 
                                  className="w-full h-24 bg-muted rounded mb-2 flex flex-col items-center justify-center text-xs text-muted-foreground"
                                  style={{ display: 'none' }}
                                >
                                  <ImageIcon className="w-6 h-6 mb-1" />
                                  <span className="text-center">Image failed to load</span>
                                </div>
                              </div>
                            ) : file.file_type.startsWith('video/') ? (
                              <div className="w-full h-24 bg-muted rounded mb-2 flex items-center justify-center">
                                <Video className="w-8 h-8 text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="w-full h-24 bg-muted rounded mb-2 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <p className="text-xs truncate" title={file.original_name}>
                              {file.original_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.file_size / 1024).toFixed(1)} KB
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 break-all" title={imageUrl}>
                              URL: {imageUrl ? imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('/') + 15) + '...' : 'No URL'}
                            </p>
                          </div>
                        );
                      })}
                      {mediaFiles.length === 0 && (
                        <div className="col-span-4 text-center py-8 text-muted-foreground">
                          No media files yet. Upload your first file above!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
          {/* Create New Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNewPost({
                        ...newPost,
                        title,
                        slug: generateSlug(title),
                        meta_title: title
                      });
                    }}
                    placeholder="Enter post title"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={newPost.slug}
                    onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                    placeholder="post-slug"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Main Content</Label>
                <Textarea
                  id="content"
                  value={newPost.content?.text || ''}
                  onChange={(e) => setNewPost({ 
                    ...newPost, 
                    content: { ...newPost.content, text: e.target.value }
                  })}
                  placeholder="Write your blog post content here..."
                  rows={10}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Main body content of your blog post
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newPost.status} onValueChange={(value) => setNewPost({ ...newPost, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cover_image">Cover Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cover_image"
                      value={newPost.cover_image_url}
                      onChange={(e) => setNewPost({ ...newPost, cover_image_url: e.target.value })}
                      placeholder="https://... or select from media"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedCoverField('new');
                        setShowMediaDialog(true);
                      }}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  {newPost.cover_image_url && (
                    <div className="mt-2">
                      <img 
                        src={newPost.cover_image_url} 
                        alt="Cover preview" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={newPost.meta_description}
                  onChange={(e) => setNewPost({ ...newPost, meta_description: e.target.value })}
                  placeholder="SEO meta description"
                  rows={2}
                />
              </div>

              <Button onClick={createPost} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>

          {/* Posts List */}
          <Card>
            <CardHeader>
              <CardTitle>All Posts ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Post: {post.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Title</Label>
                                  <Input
                                    value={editingPost?.title || post.title}
                                    onChange={(e) => setEditingPost({
                                      ...post,
                                      ...editingPost,
                                      title: e.target.value,
                                      slug: generateSlug(e.target.value)
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Slug</Label>
                                  <Input
                                    value={editingPost?.slug || post.slug}
                                    onChange={(e) => setEditingPost({
                                      ...post,
                                      ...editingPost,
                                      slug: e.target.value
                                    })}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Excerpt</Label>
                                <Textarea
                                  value={editingPost?.excerpt || post.excerpt}
                                  onChange={(e) => setEditingPost({
                                    ...post,
                                    ...editingPost,
                                    excerpt: e.target.value
                                  })}
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label>Main Content</Label>
                                <Textarea
                                  value={editingPost?.content?.text || post.content?.text || ''}
                                  onChange={(e) => setEditingPost({
                                    ...post,
                                    ...editingPost,
                                    content: { 
                                      ...(editingPost?.content || post.content), 
                                      text: e.target.value 
                                    }
                                  })}
                                  rows={10}
                                  className="min-h-[200px]"
                                  placeholder="Write your blog post content here..."
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Main body content of your blog post
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Status</Label>
                                  <Select 
                                    value={editingPost?.status || post.status} 
                                    onValueChange={(value) => setEditingPost({
                                      ...post,
                                      ...editingPost,
                                      status: value
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="draft">Draft</SelectItem>
                                      <SelectItem value="published">Published</SelectItem>
                                      <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Cover Image</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={editingPost?.cover_image_url || post.cover_image_url || ''}
                                      onChange={(e) => setEditingPost({
                                        ...post,
                                        ...editingPost,
                                        cover_image_url: e.target.value
                                      })}
                                      placeholder="https://... or select from media"
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedCoverField('edit');
                                        setShowMediaDialog(true);
                                      }}
                                    >
                                      <ImageIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {(editingPost?.cover_image_url || post.cover_image_url) && (
                                    <div className="mt-2">
                                      <img 
                                        src={editingPost?.cover_image_url || post.cover_image_url} 
                                        alt="Cover preview" 
                                        className="w-32 h-20 object-cover rounded border"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => updatePost(editingPost || post)}
                                  className="flex-1"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingPost(null)}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No blog posts yet. Create your first post above!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* Create New Category */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={newCategory.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewCategory({
                        ...newCategory,
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label htmlFor="category-slug">Slug</Label>
                  <Input
                    id="category-slug"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="category-slug"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <Button onClick={createCategory} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No categories yet. Create your first category above!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Blog settings and configuration options coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};