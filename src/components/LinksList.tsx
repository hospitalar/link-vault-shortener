
import React from 'react';
import { useLinks, Link } from '../contexts/LinksContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, Copy, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LinksList: React.FC = () => {
  const { links, removeLink, deleteLink } = useLinks();
  const { toast } = useToast();

  const copyToClipboard = async (shortCode: string) => {
    const fullUrl = `${window.location.origin}/${shortCode}`;
    await navigator.clipboard.writeText(fullUrl);
    
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência",
    });
  };

  const handleRemove = (id: string, shortCode: string) => {
    removeLink(id);
    toast({
      title: "Link removido",
      description: `Link ${shortCode} foi removido`,
      variant: "destructive",
    });
  };

  const handleDelete = (id: string, shortCode: string) => {
    deleteLink(id);
    toast({
      title: "Link excluído",
      description: `Link ${shortCode} foi excluído permanentemente`,
      variant: "destructive",
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (links.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-12">
          <ExternalLink className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum link criado</h3>
          <p className="text-gray-500">Crie seu primeiro link encurtado acima</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <ExternalLink className="w-5 h-5" />
          Links Ativos ({links.length})
        </CardTitle>
        <CardDescription>
          Gerencie todos os seus links encurtados
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {links.map((link: Link, index) => (
            <div 
              key={link.id} 
              className={`p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index === links.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="font-mono text-sm">
                      /{link.shortCode}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{link.clicks} cliques</span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 truncate" title={link.originalUrl}>
                      {link.originalUrl}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Criado em {formatDate(link.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => copyToClipboard(link.shortCode)}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    onClick={() => window.open(link.originalUrl, '_blank')}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    onClick={() => handleRemove(link.id, link.shortCode)}
                    size="sm"
                    variant="outline"
                    className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    Remover
                  </Button>
                  
                  <Button
                    onClick={() => handleDelete(link.id, link.shortCode)}
                    size="sm"
                    variant="outline"
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinksList;
