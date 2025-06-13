import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelectInput from './MultiSelectInput';
import FeatureCheckboxes from './FeatureCheckboxes';
import { useUpdateContent } from '@/hooks/useContentMutations';
import { Loader2 } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  type: 'Movie' | 'Web Series' | 'Show';
  releaseYear: string;
  ratingType: string;
  rating: string;
  description: string;
  selectedGenres: string[];
  featuredIn: string[];
  thumbnailUrl: string;
  trailerUrl: string;
  videoUrl?: string;
  directors: string[];
  writers: string[];
  cast: string[];
  duration?: string;
  views?: number;
  seasons?: any[];
}

interface EditContentDialogProps {
  content: Content;
  open: boolean;
  onClose: () => void;
  onSave: (content: Content) => void;
}

const EditContentDialog: React.FC<EditContentDialogProps> = ({
  content,
  open,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Content>(content);
  const [originalType, setOriginalType] = useState<string>(content.type);

  const updateMutation = useUpdateContent();

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Family',
    'Animation', 'Documentary', 'Reality'
  ];

  const ratingTypes = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'];
  const contentTypes = ['Movie', 'Web Series', 'Show'];

  useEffect(() => {
    // Ensure all arrays are properly initialized
    setFormData({
      ...content,
      selectedGenres: content.selectedGenres || [],
      featuredIn: content.featuredIn || [],
      directors: content.directors || [],
      writers: content.writers || [],
      cast: content.cast || [],
    });
    setOriginalType(content.type);
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        ...formData,
        originalType
      });
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleCancel = () => {
    setFormData(content);
    setOriginalType(content.type);
    onClose();
  };

  const handleInputChange = (field: keyof Content, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderContentForm = () => {
    return (
      <>
        {/* Basic Information */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="bg-background/50 border-border/30"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-foreground">Content Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger className="bg-background/50 border-border/30">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="bg-background/50 border-border/30 min-h-[100px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="releaseYear" className="text-foreground">Release Year</Label>
            <Input
              id="releaseYear"
              type="number"
              value={formData.releaseYear}
              onChange={(e) => handleInputChange('releaseYear', e.target.value)}
              className="bg-background/50 border-border/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ratingType" className="text-foreground">Rating Type</Label>
            <Select value={formData.ratingType} onValueChange={(value) => handleInputChange('ratingType', value)}>
              <SelectTrigger className="bg-background/50 border-border/30">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {ratingTypes.map(rating => (
                  <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating" className="text-foreground">Rating Score</Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', e.target.value)}
              className="bg-background/50 border-border/30"
              required
            />
          </div>
        </div>

        {/* Movie specific fields */}
        {formData.type === 'Movie' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-foreground">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration || ''}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="bg-background/50 border-border/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-foreground">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl || ''}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                className="bg-background/50 border-border/30"
                required
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl" className="text-foreground">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
              className="bg-background/50 border-border/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trailerUrl" className="text-foreground">Trailer URL</Label>
            <Input
              id="trailerUrl"
              type="url"
              value={formData.trailerUrl}
              onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
              className="bg-background/50 border-border/30"
              required
            />
          </div>
        </div>

        {/* Multi-select inputs */}
        <div className="space-y-4">
          <MultiSelectInput
            label="Genres"
            placeholder="Select genres"
            options={genres}
            selected={formData.selectedGenres}
            onChange={(values) => handleInputChange('selectedGenres', values)}
          />

          <MultiSelectInput
            label="Directors"
            placeholder="Add directors"
            options={[]}
            selected={formData.directors}
            onChange={(values) => handleInputChange('directors', values)}
            allowCustom={true}
          />

          <MultiSelectInput
            label="Writers"
            placeholder="Add writers"
            options={[]}
            selected={formData.writers}
            onChange={(values) => handleInputChange('writers', values)}
            allowCustom={true}
          />

          <MultiSelectInput
            label="Cast Members"
            placeholder="Add Cast Members"
            options={[]}
            selected={formData.cast}
            onChange={(values) => handleInputChange('cast', values)}
            allowCustom={true}
          />

          <FeatureCheckboxes
            selected={formData.featuredIn}
            onChange={(values) => handleInputChange('featuredIn', values)}
          />
        </div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card/90 backdrop-blur-sm border border-border/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Edit Content</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderContentForm()}

          <div className="flex justify-end space-x-2 pt-4 border-t border-border/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="bg-background/50 border-border/50 hover:bg-background/70"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Content'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentDialog;