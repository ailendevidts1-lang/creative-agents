import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/services/aiCodeService';
import { 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Secret {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  last_used?: string;
}

interface SecretsManagerProps {
  onClose: () => void;
}

export const SecretsManager: React.FC<SecretsManagerProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  
  const [newSecret, setNewSecret] = useState({
    name: '',
    value: '',
    description: ''
  });

  const [editValues, setEditValues] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-secrets', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('Failed to load secrets:', error);
        toast({
          title: "Error",
          description: "Failed to load secrets",
          variant: "destructive",
        });
        return;
      }

      setSecrets(data.secrets || []);
    } catch (error) {
      console.error('Failed to load secrets:', error);
      toast({
        title: "Error",
        description: "Failed to load secrets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSecret = async () => {
    if (!newSecret.name.trim() || !newSecret.value.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and value are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('manage-secrets', {
        body: { 
          action: 'create',
          name: newSecret.name,
          value: newSecret.value,
          description: newSecret.description
        }
      });

      if (error) {
        console.error('Failed to add secret:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to add secret",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Secret Added",
        description: `Successfully added ${newSecret.name}`,
      });

      setNewSecret({ name: '', value: '', description: '' });
      setIsAdding(false);
      loadSecrets();
    } catch (error) {
      console.error('Failed to add secret:', error);
      toast({
        title: "Error",
        description: "Failed to add secret",
        variant: "destructive",
      });
    }
  };

  const updateSecret = async (id: string) => {
    const value = editValues[id];
    if (!value?.trim()) {
      toast({
        title: "Validation Error",
        description: "Value is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('manage-secrets', {
        body: { 
          action: 'update',
          id,
          value
        }
      });

      if (error) {
        console.error('Failed to update secret:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update secret",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Secret Updated",
        description: "Successfully updated secret",
      });

      setEditingId(null);
      setEditValues(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      loadSecrets();
    } catch (error) {
      console.error('Failed to update secret:', error);
      toast({
        title: "Error",
        description: "Failed to update secret",
        variant: "destructive",
      });
    }
  };

  const deleteSecret = async (id: string, name: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-secrets', {
        body: { 
          action: 'delete',
          id
        }
      });

      if (error) {
        console.error('Failed to delete secret:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete secret",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Secret Deleted",
        description: `Successfully deleted ${name}`,
      });

      loadSecrets();
    } catch (error) {
      console.error('Failed to delete secret:', error);
      toast({
        title: "Error",
        description: "Failed to delete secret",
        variant: "destructive",
      });
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const getSecretValue = async (id: string) => {
    if (visibleSecrets.has(id) && !editValues[id]) {
      try {
        const { data, error } = await supabase.functions.invoke('manage-secrets', {
          body: { action: 'get', id }
        });

        if (error) {
          console.error('Failed to get secret value:', error);
          return;
        }

        setEditValues(prev => ({ ...prev, [id]: data.value }));
      } catch (error) {
        console.error('Failed to get secret value:', error);
      }
    }
  };

  useEffect(() => {
    visibleSecrets.forEach(id => getSecretValue(id));
  }, [visibleSecrets]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading secrets...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Secrets Manager
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage API keys and secrets for your projects
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add New Secret */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Add New Secret</h3>
                <Button
                  size="sm"
                  onClick={() => setIsAdding(!isAdding)}
                  variant={isAdding ? "secondary" : "default"}
                >
                  {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            
            {isAdding && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="secret-name">Name *</Label>
                    <Input
                      id="secret-name"
                      placeholder="e.g., OPENAI_API_KEY"
                      value={newSecret.name}
                      onChange={(e) => setNewSecret(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secret-description">Description</Label>
                    <Input
                      id="secret-description"
                      placeholder="e.g., OpenAI API key for AI features"
                      value={newSecret.description}
                      onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secret-value">Value *</Label>
                  <Input
                    id="secret-value"
                    type="password"
                    placeholder="Enter the secret value"
                    value={newSecret.value}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
                <Button onClick={addSecret} className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Add Secret
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Existing Secrets */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              Existing Secrets
              <Badge variant="secondary">{secrets.length}</Badge>
            </h3>

            {secrets.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No secrets configured yet</p>
                  <p className="text-sm">Add your first API key or secret above</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {secrets.map((secret) => (
                  <Card key={secret.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{secret.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(secret.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          
                          {secret.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {secret.description}
                            </p>
                          )}

                          {editingId === secret.id ? (
                            <div className="flex gap-2 mt-2">
                              <Input
                                type={visibleSecrets.has(secret.id) ? "text" : "password"}
                                value={editValues[secret.id] || ''}
                                onChange={(e) => setEditValues(prev => ({ 
                                  ...prev, 
                                  [secret.id]: e.target.value 
                                }))}
                                placeholder="Enter new value"
                              />
                              <Button
                                size="sm"
                                onClick={() => updateSecret(secret.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            visibleSecrets.has(secret.id) && editValues[secret.id] && (
                              <div className="mt-2 p-2 bg-secondary rounded text-sm font-mono">
                                {editValues[secret.id]}
                              </div>
                            )
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSecretVisibility(secret.id)}
                          >
                            {visibleSecrets.has(secret.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(secret.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Secret</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{secret.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteSecret(secret.id, secret.name)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
