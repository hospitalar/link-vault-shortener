
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Link {
  id: string;
  user_id: string;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
  is_removed: boolean;
  is_deleted: boolean;
}

// Configuração de links padronizados
const PREDEFINED_LINKS: Record<string, string> = {
  'l6Jik': 'https://www.joinsecret.com/pt?r=faa6d9e759de'
};

const RedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const getLinkByCode = async (shortCode: string): Promise<Link | null> => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('short_code', shortCode)
        .eq('is_deleted', false)
        .eq('is_removed', false)
        .single();

      if (error || !data) {
        console.error('Error fetching link:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching link:', error);
      return null;
    }
  };

  const incrementClicks = async (shortCode: string) => {
    try {
      const { data: currentLink } = await supabase
        .from('links')
        .select('clicks')
        .eq('short_code', shortCode)
        .single();

      if (currentLink) {
        const { error } = await supabase
          .from('links')
          .update({ clicks: currentLink.clicks + 1 })
          .eq('short_code', shortCode);

        if (error) {
          console.error('Error incrementing clicks:', error);
        }
      }
    } catch (error) {
      console.error('Error incrementing clicks:', error);
    }
  };

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (code) {
        console.log('Fetching link for code:', code);
        
        // Verificar primeiro se é um link predefinido
        if (PREDEFINED_LINKS[code]) {
          console.log('Predefined link found:', PREDEFINED_LINKS[code]);
          console.log('Redirecting to predefined URL:', PREDEFINED_LINKS[code]);
          window.location.href = PREDEFINED_LINKS[code];
          return;
        }
        
        // Se não é predefinido, buscar no banco de dados
        const foundLink = await getLinkByCode(code);
        
        if (foundLink) {
          console.log('Link found:', foundLink);
          await incrementClicks(code);
          console.log('Redirecting to:', foundLink.original_url);
          window.location.href = foundLink.original_url;
          return;
        } else {
          console.log('Link not found for code:', code);
          setNotFound(true);
        }
      }
      setLoading(false);
    };

    fetchAndRedirect();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Link não encontrado</h1>
            <p className="text-gray-600 mb-6">
              O código <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span> não corresponde a nenhum link ativo.
            </p>
            <a 
              href="/" 
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Voltar à página inicial
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default RedirectPage;
