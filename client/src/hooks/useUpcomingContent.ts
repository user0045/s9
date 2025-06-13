import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UpcomingContent {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  contentType: 'Movie' | 'Web Series' | 'Show';
  thumbnailUrl?: string;
  trailerUrl?: string;
  contentOrder: number;
  genre: string[];
  castMembers: string[];
  directors: string[];
  writers: string[];
  ratingType?: string;
}

export const useUpcomingContent = () => {
  return useQuery({
    queryKey: ['upcoming-content'],
    queryFn: async () => {
      console.log('Fetching upcoming content from database...');
      const { data, error } = await supabase
        .from('upcoming_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching upcoming content:', error);
        throw error;
      }

      console.log('Fetched upcoming content:', data);
      return data;
    },
  });
};