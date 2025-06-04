
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Link {
  id: string;
  user_id: string;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
  is_removed: boolean;
  is_deleted: boolean;
}

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const generateShortCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const fetchLinks = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching links:', error);
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, [user]);

  const addLink = async (originalUrl: string): Promise<string | null> => {
    if (!user) return null;

    let shortCode = generateShortCode();
    
    // Verificar se o código já existe
    let codeExists = true;
    while (codeExists) {
      const { data } = await supabase
        .from('links')
        .select('short_code')
        .eq('short_code', shortCode)
        .single();
      
      if (!data) {
        codeExists = false;
      } else {
        shortCode = generateShortCode();
      }
    }

    const { data, error } = await supabase
      .from('links')
      .insert([{
        user_id: user.id,
        original_url: originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`,
        short_code: shortCode
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating link:', error);
      return null;
    }

    setLinks(prev => [data, ...prev]);
    return shortCode;
  };

  const removeLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .update({ is_removed: true })
      .eq('id', id);

    if (error) {
      console.error('Error removing link:', error);
    } else {
      setLinks(prev => prev.map(link => 
        link.id === id ? { ...link, is_removed: true } : link
      ));
    }
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
      console.error('Error deleting link:', error);
    } else {
      setLinks(prev => prev.filter(link => link.id !== id));
    }
  };

  const getLinkByCode = async (code: string): Promise<Link | null> => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', code)
      .eq('is_deleted', false)
      .eq('is_removed', false)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  };

  const incrementClicks = async (code: string) => {
    const { data: currentLink } = await supabase
      .from('links')
      .select('clicks')
      .eq('short_code', code)
      .single();

    if (currentLink) {
      const { error } = await supabase
        .from('links')
        .update({ clicks: currentLink.clicks + 1 })
        .eq('short_code', code);

      if (error) {
        console.error('Error incrementing clicks:', error);
      } else {
        setLinks(prev => prev.map(link => 
          link.short_code === code 
            ? { ...link, clicks: link.clicks + 1 }
            : link
        ));
      }
    }
  };

  return {
    links,
    loading,
    addLink,
    removeLink,
    deleteLink,
    getLinkByCode,
    incrementClicks
  };
};
