
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  clicks: number;
}

interface LinksContextType {
  links: Link[];
  addLink: (originalUrl: string) => string;
  removeLink: (id: string) => void;
  deleteLink: (id: string) => void;
  getLinkByCode: (code: string) => Link | undefined;
  incrementClicks: (code: string) => void;
}

const LinksContext = createContext<LinksContextType | undefined>(undefined);

export const useLinks = () => {
  const context = useContext(LinksContext);
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinksProvider');
  }
  return context;
};

const generateShortCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const LinksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    const storedLinks = localStorage.getItem('shortLinks');
    if (storedLinks) {
      const parsedLinks = JSON.parse(storedLinks).map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt)
      }));
      setLinks(parsedLinks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shortLinks', JSON.stringify(links));
  }, [links]);

  const addLink = (originalUrl: string): string => {
    let shortCode = generateShortCode();
    
    // Verificar se o código já existe
    while (links.some(link => link.shortCode === shortCode)) {
      shortCode = generateShortCode();
    }

    const newLink: Link = {
      id: Date.now().toString(),
      shortCode,
      originalUrl: originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`,
      createdAt: new Date(),
      clicks: 0
    };

    setLinks(prev => [newLink, ...prev]);
    return shortCode;
  };

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const getLinkByCode = (code: string): Link | undefined => {
    return links.find(link => link.shortCode === code);
  };

  const incrementClicks = (code: string) => {
    setLinks(prev => prev.map(link => 
      link.shortCode === code 
        ? { ...link, clicks: link.clicks + 1 }
        : link
    ));
  };

  return (
    <LinksContext.Provider value={{
      links,
      addLink,
      removeLink,
      deleteLink,
      getLinkByCode,
      incrementClicks
    }}>
      {children}
    </LinksContext.Provider>
  );
};
