
import React, { useState } from 'react';
import { useLinks } from '../contexts/LinksContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Link, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LinkCreator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { addLink } = useLinks();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const shortCode = addLink(url.trim());
    setGeneratedCode(shortCode);
    setUrl('');
    setIsLoading(false);
    
    toast({
      title: "Link criado com sucesso!",
      description: `Código: ${shortCode}`,
    });
  };

  const copyToClipboard = async () => {
    const fullUrl = `${window.location.origin}/${generatedCode}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência",
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Plus className="w-5 h-5" />
          Criar Novo Link
        </CardTitle>
        <CardDescription>
          Digite a URL que deseja encurtar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL Original</Label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="url"
                type="url"
                placeholder="https://exemplo.com ou exemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Link Curto'}
          </Button>
        </form>

        {generatedCode && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Label className="text-sm font-medium text-green-800">Link Gerado:</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={`${window.location.origin}/${generatedCode}`}
                readOnly
                className="bg-white"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkCreator;
