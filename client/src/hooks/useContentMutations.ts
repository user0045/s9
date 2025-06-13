
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateContentData {
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
  seasons?: any[];
}

export const useUpdateContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ originalType, ...data }: UpdateContentData & { originalType: string }) => {
      console.log('Updating content:', data);

      // Get the original upload_content entry
      const { data: uploadContent, error: uploadError } = await supabase
        .from('upload_content')
        .select('*')
        .eq('id', data.id)
        .single();

      if (uploadError) throw uploadError;

      // If content type hasn't changed, update existing content
      if (originalType === data.type) {
        // Update upload_content
        const { error: updateUploadError } = await supabase
          .from('upload_content')
          .update({
            title: data.title,
            genre: data.selectedGenres,
          })
          .eq('id', data.id);

        if (updateUploadError) throw updateUploadError;

        // Update specific content table based on type
        if (data.type === 'Movie') {
          const { error: movieError } = await supabase
            .from('movie')
            .update({
              description: data.description,
              release_year: parseInt(data.releaseYear),
              rating_type: data.ratingType as any,
              rating: parseFloat(data.rating),
              duration: parseInt(data.duration || '0'),
              director: data.directors,
              writer: data.writers,
              cast_members: data.cast,
              thumbnail_url: data.thumbnailUrl,
              trailer_url: data.trailerUrl,
              video_url: data.videoUrl,
              feature_in: data.featuredIn,
            })
            .eq('content_id', uploadContent.content_id);

          if (movieError) throw movieError;
        } else if (data.type === 'Show') {
          const { error: showError } = await supabase
            .from('show')
            .update({
              title: data.title,
              description: data.description,
              release_year: parseInt(data.releaseYear),
              rating_type: data.ratingType as any,
              rating: parseFloat(data.rating),
              thumbnail_url: data.thumbnailUrl,
              trailer_url: data.trailerUrl,
              genres: data.selectedGenres,
              directors: data.directors,
              writers: data.writers,
              cast_members: data.cast,
              feature_in: data.featuredIn,
            })
            .eq('id', uploadContent.content_id);

          if (showError) throw showError;
        }
      } else {
        // Content type changed - delete old content and create new
        await deleteContentFromAllTables(uploadContent.content_id, originalType);

        // Create new content based on new type
        if (data.type === 'Movie') {
          const { data: movieResult, error: movieError } = await supabase
            .from('movie')
            .insert([{
              description: data.description,
              release_year: parseInt(data.releaseYear),
              rating_type: data.ratingType as any,
              rating: parseFloat(data.rating),
              duration: parseInt(data.duration || '0'),
              director: data.directors,
              writer: data.writers,
              cast_members: data.cast,
              thumbnail_url: data.thumbnailUrl,
              trailer_url: data.trailerUrl,
              video_url: data.videoUrl,
              feature_in: data.featuredIn,
            }])
            .select()
            .single();

          if (movieError) throw movieError;

          // Update upload_content with new content_id and type
          const { error: updateError } = await supabase
            .from('upload_content')
            .update({
              title: data.title,
              content_type: data.type as any,
              genre: data.selectedGenres,
              content_id: movieResult.content_id,
            })
            .eq('id', data.id);

          if (updateError) throw updateError;
        } else if (data.type === 'Show') {
          const { data: showResult, error: showError } = await supabase
            .from('show')
            .insert([{
              title: data.title,
              description: data.description,
              content_type: 'Show' as any,
              release_year: parseInt(data.releaseYear),
              rating_type: data.ratingType as any,
              rating: parseFloat(data.rating),
              thumbnail_url: data.thumbnailUrl,
              trailer_url: data.trailerUrl,
              genres: data.selectedGenres,
              directors: data.directors,
              writers: data.writers,
              cast_members: data.cast,
              feature_in: data.featuredIn,
              episode_id_list: [],
            }])
            .select()
            .single();

          if (showError) throw showError;

          // Update upload_content with new content_id and type
          const { error: updateError } = await supabase
            .from('upload_content')
            .update({
              title: data.title,
              content_type: data.type as any,
              genre: data.selectedGenres,
              content_id: showResult.id,
            })
            .eq('id', data.id);

          if (updateError) throw updateError;
        } else if (data.type === 'Web Series') {
          const { data: webSeriesResult, error: webSeriesError } = await supabase
            .from('web_series')
            .insert([{
              season_id_list: [],
            }])
            .select()
            .single();

          if (webSeriesError) throw webSeriesError;

          // Update upload_content with new content_id and type
          const { error: updateError } = await supabase
            .from('upload_content')
            .update({
              title: data.title,
              content_type: data.type as any,
              genre: data.selectedGenres,
              content_id: webSeriesResult.content_id,
            })
            .eq('id', data.id);

          if (updateError) throw updateError;
        }
      }

      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Content updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['all-content'] });
    },
    onError: (error) => {
      console.error('Error updating content:', error);
      toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
    },
  });
};

const deleteContentFromAllTables = async (contentId: string, contentType: string) => {
  if (contentType === 'Movie') {
    const { error } = await supabase
      .from('movie')
      .delete()
      .eq('content_id', contentId);
    if (error) throw error;
  } else if (contentType === 'Web Series') {
    // Get web series data to find seasons and episodes
    const { data: webSeriesData, error: webSeriesError } = await supabase
      .from('web_series')
      .select('*')
      .eq('content_id', contentId)
      .single();

    if (!webSeriesError && webSeriesData) {
      // Delete episodes and seasons
      if (webSeriesData.season_id_list && webSeriesData.season_id_list.length > 0) {
        for (const seasonId of webSeriesData.season_id_list) {
          const { data: seasonData, error: seasonError } = await supabase
            .from('season')
            .select('*')
            .eq('season_id', seasonId)
            .single();

          if (!seasonError && seasonData && seasonData.episode_id_list) {
            // Delete episodes
            for (const episodeId of seasonData.episode_id_list) {
              await supabase.from('episode').delete().eq('episode_id', episodeId);
            }
          }

          // Delete season
          await supabase.from('season').delete().eq('season_id', seasonId);
        }
      }

      // Delete web series
      await supabase.from('web_series').delete().eq('content_id', contentId);
    }
  } else if (contentType === 'Show') {
    // Get show data to find episodes
    const { data: showData, error: showError } = await supabase
      .from('show')
      .select('*')
      .eq('id', contentId)
      .single();

    if (!showError && showData && showData.episode_id_list) {
      // Delete episodes
      for (const episodeId of showData.episode_id_list) {
        await supabase.from('episode').delete().eq('episode_id', episodeId);
      }
    }

    // Delete show
    await supabase.from('show').delete().eq('id', contentId);
  }
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, contentId, contentType }: { id: string; contentId: string; contentType: string }) => {
      console.log('Deleting content:', { id, contentId, contentType });

      // Delete from specific content tables
      await deleteContentFromAllTables(contentId, contentType);

      // Delete from upload_content
      const { error: uploadError } = await supabase
        .from('upload_content')
        .delete()
        .eq('id', id);

      if (uploadError) throw uploadError;

      return { id };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Content deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['all-content'] });
    },
    onError: (error) => {
      console.error('Error deleting content:', error);
      toast({ title: "Error", description: "Failed to delete content", variant: "destructive" });
    },
  });
};
