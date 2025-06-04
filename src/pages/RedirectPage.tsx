
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLinks } from '../contexts/LinksContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';

const RedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { getLinkByCode, incrementClicks } = useLinks();
  const [countdown, setCountdown] = useState(3);
  const [link, setLink] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (code) {
      const foundLink = getLinkByCode(code);
      if (foundLink) {
        setLink(foundLink);
        incrementClicks(code);
        
        // Countdown para redirecionamento
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev === 1) {
              clearInterval(timer);
              window.location.href = foundLink.originalUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        setNotFound(true);
      }
    }
  }, [code, getLinkByCode, incrementClicks]);

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
              <span className="text-blue-600 break-all">{link.originalUrl}</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = link.originalUrl}
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
