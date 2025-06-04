
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LinkCreator from './LinkCreator';
import LinksList from './LinksList';
import { Button } from '@/components/ui/button';
import { LogOut, Link, BarChart3 } from 'lucide-react';
import { useLinks } from '../hooks/useLinks';

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const { links } = useLinks();

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const activeLinks = links.filter(link => !link.is_removed);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Link className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gerenciador de Links</h1>
                <p className="text-sm text-gray-500">Bem-vindo, {user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span>{activeLinks.length} links ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{totalClicks} cliques</span>
                </div>
              </div>
              
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <LinkCreator />
          <LinksList />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
