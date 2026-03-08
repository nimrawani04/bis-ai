import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, Info, Calendar, Tag, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  affected_products: string | null;
  source: string | null;
  alert_date: string;
  is_active: boolean;
}

function getSeverityConfig(severity: string) {
  switch (severity) {
    case 'critical':
      return { icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', badge: 'bg-danger text-danger-foreground', label: 'Critical' };
    case 'warning':
      return { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', badge: 'bg-warning text-warning-foreground', label: 'Warning' };
    default:
      return { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', badge: 'bg-primary text-primary-foreground', label: 'Advisory' };
  }
}

export function SafetyAlerts() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('safety_alerts')
        .select('*')
        .eq('is_active', true)
        .order('alert_date', { ascending: false });
      if (data) setAlerts(data);
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  const displayed = showAll ? alerts : alerts.slice(0, 3);

  return (
    <section id="alerts" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-4 py-2 text-sm font-medium text-danger mb-4">
              <Bell className="h-4 w-4" />
              Safety Alerts
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Product Recalls &amp; Safety Warnings
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay informed about the latest product recalls, safety warnings, and regulatory updates from BIS and consumer protection authorities.
            </p>
          </div>

          {/* Alerts List */}
          {loading ? (
            <p className="text-center text-muted-foreground">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active safety alerts at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayed.map((alert) => {
                const config = getSeverityConfig(alert.severity);
                const Icon = config.icon;
                return (
                  <Card key={alert.id} className={`border-l-4 ${config.border} shadow-card hover:shadow-elevated transition-shadow`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${config.bg} shrink-0 mt-0.5`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className={config.badge}>{config.label}</Badge>
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {alert.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Calendar className="h-3 w-3" />
                              {new Date(alert.alert_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="font-bold text-foreground mb-2">{alert.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{alert.description}</p>
                          {(alert.affected_products || alert.source) && (
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                              {alert.affected_products && (
                                <span><strong className="text-foreground">Affected:</strong> {alert.affected_products}</span>
                              )}
                              {alert.source && (
                                <span className="flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  {alert.source}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {alerts.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show Less' : `View All ${alerts.length} Alerts`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
