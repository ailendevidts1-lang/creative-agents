import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ExternalLink, Info } from "lucide-react";
import { ToolResult } from "@/services/pipeline/types";

interface ToolResultCardProps {
  results: ToolResult[];
  planSummary?: string;
}

export function ToolResultCard({ results, planSummary }: ToolResultCardProps) {
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  const getStatusIcon = (success: boolean) => {
    return success ? CheckCircle : XCircle;
  };

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-500" : "text-destructive";
  };

  return (
    <Card className="glass-panel border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-5 w-5 text-primary" />
          Tool Execution Results
        </CardTitle>
        {planSummary && (
          <p className="text-sm text-muted-foreground">{planSummary}</p>
        )}
        <div className="flex items-center gap-2">
          {successCount > 0 && (
            <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              {successCount} succeeded
            </Badge>
          )}
          {failureCount > 0 && (
            <Badge variant="destructive" className="bg-destructive/20">
              <XCircle className="h-3 w-3 mr-1" />
              {failureCount} failed
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {results.length} total
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {results.map((result, index) => {
          const StatusIcon = getStatusIcon(result.success);
          const statusColor = getStatusColor(result.success);
          
          return (
            <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-start gap-3">
                <StatusIcon className={`h-5 w-5 ${statusColor} flex-shrink-0 mt-0.5`} />
                
                <div className="flex-1 min-w-0">
                  {/* Tool Info */}
                  {result.metadata && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.metadata.action || 'Tool'}
                      </Badge>
                      {result.metadata.stepId && (
                        <span className="text-xs text-muted-foreground">
                          ID: {result.metadata.stepId}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Success Result */}
                  {result.success && result.data && (
                    <div>
                      {result.data.message && (
                        <p className="text-sm mb-2">{result.data.message}</p>
                      )}
                      
                      {result.data.weather && (
                        <div className="bg-background/50 rounded p-3">
                          <div className="text-sm">
                            <strong>{result.data.weather.location || 'Current Location'}</strong>
                            <br />
                            {result.data.weather.description}, {result.data.weather.temperature}°C
                            {result.data.weather.humidity && (
                              <span className="text-muted-foreground">
                                {' '}• Humidity: {result.data.weather.humidity}%
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {result.data.timer && (
                        <div className="bg-background/50 rounded p-3">
                          <div className="text-sm">
                            <strong>Timer Created:</strong> {result.data.timer.name}
                            <br />
                            Duration: {Math.round(result.data.timer.duration / 60000)} minutes
                            <br />
                            Status: <Badge variant="secondary" className="text-xs">{result.data.timer.status}</Badge>
                          </div>
                        </div>
                      )}

                      {result.data.note && (
                        <div className="bg-background/50 rounded p-3">
                          <div className="text-sm">
                            <strong>Note Created:</strong> {result.data.note.title}
                            {result.data.note.content && (
                              <>
                                <br />
                                <span className="text-muted-foreground">
                                  {result.data.note.content.slice(0, 100)}
                                  {result.data.note.content.length > 100 ? '...' : ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {result.data.searchResults && (
                        <div className="bg-background/50 rounded p-3">
                          <div className="text-sm">
                            <strong>Search Results:</strong>
                            {result.data.searchResults.sources?.slice(0, 3).map((source: any, i: number) => (
                              <div key={i} className="mt-2 flex items-center gap-2">
                                <ExternalLink className="h-3 w-3" />
                                <span className="truncate">{source.title || source.url}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Generic data display */}
                      {result.data && !result.data.weather && !result.data.timer && !result.data.note && !result.data.searchResults && !result.data.message && (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-muted-foreground hover:text-foreground">
                            View raw data
                          </summary>
                          <div className="mt-2 text-xs bg-background/50 rounded p-2">
                            <pre className="overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  {/* Error Result */}
                  {!result.success && (
                    <div className="text-sm">
                      <p className="text-destructive font-medium">Execution Failed</p>
                      {result.error && (
                        <p className="text-muted-foreground mt-1">{result.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}