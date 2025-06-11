
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';

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

const RedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [countdown, setCountdown] = useState(3);
  const [link, setLink] = useState<Link | null>(null);
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
        const foundLink = await getLinkByCode(code);
        
        if (foundLink) {
          console.log('Link found:', foundLink);
          setLink(foundLink);
          await incrementClicks(code);
          
          // Countdown para redirecionamento
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev === 1) {
                clearInterval(timer);
                console.log('Redirecting to:', foundLink.original_url);
                window.location.href = foundLink.original_url;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
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
          <p className="text-gray-600">Carregando...</p>
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

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <ExternalLink className="w-8 h-8 text-blue-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Redirecionando...</h1>
          
          <div className="mb-6">
            <div className="text-6xl font-bold text-blue-500 mb-2">
              {countdown}
            </div>
            <p className="text-gray-600">segundos</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 mb-2">Você será redirecionado para:</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-mono bg-white px-2 py-1 rounded border">
                {window.location.origin}/{code}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="text-blue-600 break-all">{link.original_url}</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = link.original_url}
            className="text-blue-500 hover:text-blue-700 underline text-sm"
          >
            Ir agora
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectPage;
