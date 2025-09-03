import React, { useState } from 'react';
import { Search, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/hooks/useSkills';

interface SearchResultData {
  response: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export function SearchSkill() {
  const { performSearch, searchHistory } = useSkills();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResultData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await performSearch(query.trim());
      if (data) {
        setResult(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-accent/10">
          <Search className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Search & Q&A</h3>
          <p className="text-muted-foreground text-sm">Search the web and get AI-powered answers</p>
        </div>
      </div>

      {/* Search Form */}
      <Card className="glass-panel p-4">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything or search the web..."
            className="glass-panel flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </Card>

      {/* Search Result */}
      {result && (
        <Card className="glass-panel p-6 space-y-4">
          <h4 className="font-medium text-foreground">Answer</h4>
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="whitespace-pre-wrap">{result.response}</p>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-foreground flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Sources
              </h5>
              <div className="grid gap-3 md:grid-cols-2">
                {result.sources.map((source, index) => (
                  <Card key={index} className="glass-panel p-3">
                    <h6 className="font-medium text-sm line-clamp-2 mb-1">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {source.title}
                      </a>
                    </h6>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {source.snippet}
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              {new URL(source.url).hostname}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  )}
</Card>
)}

{/* Search History */}
{searchHistory.length > 0 && (
  <div className="space-y-4">
    <h4 className="font-medium text-foreground flex items-center">
      <Clock className="w-4 h-4 mr-2" />
      Recent Searches
    </h4>
    <div className="space-y-2">
      {searchHistory.slice(0, 5).map((item) => {
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };

        return (
          <Card key={item.id} className="glass-panel p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {item.query}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <Button
                onClick={() => {
                  setQuery(item.query);
                  setResult({
                    response: item.response || '',
                    sources: item.sources as any
                  });
                }}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  </div>
)}

      {/* No Results State */}
      {!result && !loading && (
        <Card className="glass-panel p-8 text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Ready to search</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ask me anything and I'll search the web for answers
          </p>
        </Card>
      )}
    </div>
  );
}