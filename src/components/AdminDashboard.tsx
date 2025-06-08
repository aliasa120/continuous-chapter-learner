
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Users, 
  CreditCard, 
  Bot, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  DollarSign,
  Mail,
  MessageCircle,
  Check,
  X,
  Crown,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIModel {
  id: string;
  name: string;
  endpoint: string;
  headers: Record<string, string>;
  body_template: string;
  model_type: 'transcription' | 'analysis';
  status: 'active' | 'inactive';
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'basic' | 'pro' | 'premium';
  status: 'active' | 'banned';
  daily_usage: number;
  created_at: string;
  last_active: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  daily_limit: number;
  features: string[];
  active: boolean;
}

interface ContactInfo {
  email: string;
  whatsapp: string;
  payment_instructions: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('models');
  const [models, setModels] = useState<AIModel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([
    { id: '1', name: 'Free', price: 0, daily_limit: 1, features: ['1 transcript per day', 'Basic support'], active: true },
    { id: '2', name: 'Basic', price: 1, daily_limit: 5, features: ['5 transcripts per day', 'Email support'], active: true },
    { id: '3', name: 'Pro', price: 2, daily_limit: 10, features: ['10 transcripts per day', 'Priority support', 'Analysis features'], active: true },
    { id: '4', name: 'Premium', price: 3, daily_limit: 20, features: ['20 transcripts per day', 'Premium support', 'All features'], active: true }
  ]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'legendgamerz9999@gmail.com',
    whatsapp: '',
    payment_instructions: 'Contact us for manual payment processing.'
  });
  const [newModelCurl, setNewModelCurl] = useState('');
  const { toast } = useToast();

  // Mock data loading - in a real app, this would load from Supabase
  useEffect(() => {
    // Mock models data
    setModels([
      {
        id: '1',
        name: 'Gemini 2.0 Flash',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        headers: { 'Content-Type': 'application/json' },
        body_template: '{"contents":[{"parts":[{"text":"{{prompt}}"}]}]}',
        model_type: 'transcription',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]);

    // Mock users data
    setUsers([
      {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        plan: 'free',
        status: 'active',
        daily_usage: 0,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }
    ]);
  }, []);

  const parseCurlToModel = (curlCommand: string): Partial<AIModel> | null => {
    try {
      const urlMatch = curlCommand.match(/curl\s+"([^"]+)"/);
      const headerMatches = curlCommand.match(/-H\s+"([^"]+)"/g);
      const dataMatch = curlCommand.match(/-d\s+'([^']+)'/);
      
      if (!urlMatch) return null;

      const endpoint = urlMatch[1];
      const headers: Record<string, string> = {};
      
      if (headerMatches) {
        headerMatches.forEach(header => {
          const headerContent = header.match(/-H\s+"([^"]+)"/)?.[1];
          if (headerContent) {
            const [key, value] = headerContent.split(': ');
            headers[key] = value;
          }
        });
      }

      const bodyTemplate = dataMatch ? dataMatch[1] : '{}';
      
      // Detect model type based on endpoint
      const modelType = endpoint.includes('chat/completions') || endpoint.includes('generateContent') 
        ? 'transcription' 
        : 'analysis';

      // Extract model name from body or endpoint
      let modelName = 'Unknown Model';
      try {
        const bodyObj = JSON.parse(bodyTemplate);
        if (bodyObj.model) {
          modelName = bodyObj.model;
        }
      } catch {
        // If JSON parsing fails, try to extract from endpoint
        const pathParts = endpoint.split('/');
        modelName = pathParts[pathParts.length - 1] || 'Unknown Model';
      }

      return {
        name: modelName,
        endpoint,
        headers,
        body_template: bodyTemplate,
        model_type: modelType as 'transcription' | 'analysis',
        status: 'active' as const
      };
    } catch (error) {
      console.error('Error parsing cURL:', error);
      return null;
    }
  };

  const addModelFromCurl = () => {
    const parsedModel = parseCurlToModel(newModelCurl);
    if (!parsedModel) {
      toast({
        title: "Error",
        description: "Could not parse the cURL command. Please check the format.",
        variant: "destructive"
      });
      return;
    }

    const newModel: AIModel = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      ...parsedModel as Omit<AIModel, 'id' | 'created_at'>
    };

    setModels(prev => [newModel, ...prev]);
    setNewModelCurl('');
    toast({
      title: "Success",
      description: "Model added successfully! Note: This is stored locally until database is set up."
    });
  };

  const toggleModelStatus = (modelId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, status: newStatus as 'active' | 'inactive' } : model
    ));

    toast({
      title: "Success",
      description: `Model ${newStatus === 'active' ? 'activated' : 'deactivated'}`
    });
  };

  const deleteModel = (modelId: string) => {
    setModels(prev => prev.filter(model => model.id !== modelId));
    toast({
      title: "Success",
      description: "Model deleted successfully"
    });
  };

  const updateUserPlan = (userId: string, newPlan: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, plan: newPlan as any } : user
    ));

    toast({
      title: "Success",
      description: "User plan updated successfully"
    });
  };

  const toggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus as 'active' | 'banned' } : user
    ));

    toast({
      title: "Success",
      description: `User ${newStatus === 'active' ? 'activated' : 'banned'}`
    });
  };

  const updatePricing = (planId: string, updates: Partial<PricingPlan>) => {
    setPricing(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    ));

    toast({
      title: "Success",
      description: "Pricing updated successfully"
    });
  };

  const saveContactInfo = () => {
    toast({
      title: "Success",
      description: "Contact information updated successfully! Note: This is stored locally until database is set up."
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 premium-gradient bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage AI models, users, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bot className="h-5 w-5" />
                  Add New AI Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Paste cURL Command</Label>
                  <Textarea
                    placeholder="Paste your cURL command here..."
                    value={newModelCurl}
                    onChange={(e) => setNewModelCurl(e.target.value)}
                    className="min-h-32"
                  />
                </div>
                <Button onClick={addModelFromCurl} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </CardContent>
            </Card>

            <Card className="border-accent/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-accent">Existing Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models.map((model) => (
                    <div key={model.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">{model.endpoint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={model.model_type === 'transcription' ? 'default' : 'secondary'}>
                            {model.model_type}
                          </Badge>
                          <Badge variant={model.status === 'active' ? 'default' : 'destructive'}>
                            {model.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleModelStatus(model.id, model.status)}
                        >
                          {model.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {model.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteModel(model.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-success/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-success">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Daily Usage: {user.daily_usage} / {pricing.find(p => p.name.toLowerCase() === user.plan)?.daily_limit || 1}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                            {user.plan}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select value={user.plan} onValueChange={(value) => updateUserPlan(user.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant={user.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleUserStatus(user.id, user.status)}
                        >
                          {user.status === 'active' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          {user.status === 'active' ? 'Ban' : 'Unban'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Pricing Plans */}
            <Card className="border-warning/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <CreditCard className="h-5 w-5" />
                  Pricing Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pricing.map((plan) => (
                    <div key={plan.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {plan.name}
                            {plan.name === 'Premium' && <Crown className="h-4 w-4 text-yellow-500" />}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ${plan.price}/month - {plan.daily_limit} transcripts/day
                          </p>
                        </div>
                        <Switch 
                          checked={plan.active}
                          onCheckedChange={(checked) => updatePricing(plan.id, { active: checked })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Price ($)</Label>
                          <Input 
                            type="number"
                            value={plan.price}
                            onChange={(e) => updatePricing(plan.id, { price: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Daily Limit</Label>
                          <Input 
                            type="number"
                            value={plan.daily_limit}
                            onChange={(e) => updatePricing(plan.id, { daily_limit: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-destructive/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Email</Label>
                    <Input 
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>WhatsApp Link</Label>
                    <Input 
                      placeholder="https://wa.me/..."
                      value={contactInfo.whatsapp}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Payment Instructions</Label>
                  <Textarea 
                    value={contactInfo.payment_instructions}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, payment_instructions: e.target.value }))}
                  />
                </div>
                <Button onClick={saveContactInfo} className="w-full">
                  Save Contact Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
