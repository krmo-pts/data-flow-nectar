
import { useState, useEffect } from 'react';
import LineageContainer from '@/components/lineage/LineageContainer';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for a smoother initial animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 h-14 flex-shrink-0">
        <div className="container h-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">Data Lineage Explorer</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <p className="text-sm text-muted-foreground">Loading lineage data...</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full animate-fade-in">
            <LineageContainer />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
