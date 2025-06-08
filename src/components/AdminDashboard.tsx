
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Shield, 
  LogOut, 
  Cpu, 
  Users, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  Mail,
  Phone,
  Globe,
  Crown,
  AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface ModelConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  type: 'transcription' | 'analysis';
  isActive: boolean;
}

interface UserAccount {
  id: string;
  email: string;
  plan: 'free' | 'basic' | 'pro' | 'premium';
  status: 'active' | 'banned';
  dailyUsage: number;
  dailyLimit: number;
  lastUsed: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  dailyLimit: number;
  isActive: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: '1',
      name: 'Gemini 2.5 Flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      apiKey: 'GEMINI_API_KEY',
      type: 'transcription',
      isActive: true
    }
  ]);

  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: '1',
      email: 'user@example.com',
      plan: 'free',
      status: 'active',
      dailyUsage: 1,
      dailyLimit: 1,
      lastUsed: '2024-01-15'
    },
    {
      id: '2',
      email: 'premium@example.com',
      plan: 'premium',
      status: 'active',
      dailyUsage: 5,
      dailyLimit: 20,
      lastUsed: '2024-01-15'
    }
  ]);

  const [pricing, setPricing] = useState<PricingPlan[]>([
    { id: '1', name: 'Free', price: 0, dailyLimit: 1, isActive: true },
    { id: '2', name: 'Basic', price: 1, dailyLimit: 5, isActive: true },
    { id: '3', name: 'Pro', price: 2, dailyLimit: 10, isActive: true },
    { id: '4', name: 'Premium', price: 3, dailyLimit: 20, isActive: true }
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: 'support@transcription.app',
    whatsapp: '+1234567890',
    website: 'https://transcription.app'
  });

  const [newModel, setNewModel] = useState({
    name: '',
    curlCommand: '',
    type: 'transcription' as 'transcription' | 'analysis'
  });

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const parseCurlCommand = (curl: string) => {
    try {
      const urlMatch = curl.match(/curl\s+"([^"]+)"/);
      const endpoint = urlMatch ? urlMatch[1] : '';
      
      const nameMatch = curl.match(/model["']:\s*["']([^"']+)["']/);
      const modelName = nameMatch ? nameMatch[1] : 'Unknown Model';
      
      return { endpoint, modelName };
    } catch (error) {
      toast.error('Invalid cURL command format');
      return null;
    }
  };

  const handleAddModel = () => {
    if (!newModel.name || !newModel.curlCommand) {
      toast.error('Please fill all fields');
      return;
    }

    const parsed = parseCurlCommand(newModel.curlCommand);
    if (!parsed) return;

    const model: ModelConfig = {
      id: Date.now().toString(),
      name: newModel.name,
      endpoint: parsed.endpoint,
      apiKey: 'API_KEY_PLACEHOLDER',
      type: newModel.type,
      isActive: true
    };

    setModels([...models, model]);
    setNewModel({ name: '', curlCommand: '', type: 'transcription' });
    toast.success('Model added successfully');
  };

  const handleDeleteModel = (id: string) => {
    setModels(models.filter(m => m.id !== id));
    toast.success('Model deleted');
  };

  const handleToggleModel = (id: string) => {
    setModels(models.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const handleUserStatusChange = (userId: string, status: 'active' | 'banned') => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status } : u
    ));
    toast.success(`User ${status === 'banned' ? 'banned' : 'activated'}`);
  };

  const handleUserPlanChange = (userId: string, plan: 'free' | 'basic' | 'pro' | 'premium') => {
    const planLimits = {
      free: 1,
      basic: 5,
      pro: 10,
      premium: 20
    };
    
    setUsers(users.map(u => 
      u.id === userId ? { ...u, plan, dailyLimit: planLimits[plan] } : u
    ));
    toast.success('User plan updated');
  };

  const handleUpdatePricing = (planId: string, updates: Partial<PricingPlan>) => {
    setPricing(pricing.map(p => 
      p.id === planId ? { ...p, ...updates } : p
    ));
    toast.success('Pricing updated');
  };

  const handleContactUpdate = () => {
    toast.success('Contact information updated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-primary/5 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-destructive flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <Button onClick={onLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">App Settings</TabsTrigger>
          </TabsList>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    AI Models Configuration
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Model
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New AI Model</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Model Name</Label>
                          <Input
                            value={newModel.name}
                            onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                            placeholder="e.g., GPT-4, Claude-3"
                          />
                        </div>
                        <div>
                          <Label>Model Type</Label>
                          <Select 
                            value={newModel.type} 
                            onValueChange={(value: 'transcription' | 'analysis') => 
                              setNewModel({...newModel, type: value})
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="transcription">Transcription</SelectItem>
                              <SelectItem value="analysis">AI Analysis</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>cURL Command</Label>
                          <Textarea
                            value={newModel.curlCommand}
                            onChange={(e) => setNewModel({...newModel, curlCommand: e.target.value})}
                            placeholder="Paste the complete cURL command here..."
                            rows={8}
                          />
                        </div>
                        <Button onClick={handleAddModel} className="w-full">
                          Add Model
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models.map((model) => (
                    <div key={model.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">{model.endpoint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={model.type === 'transcription' ? 'default' : 'secondary'}>
                            {model.type}
                          </Badge>
                          <Switch
                            checked={model.isActive}
                            onCheckedChange={() => handleToggleModel(model.id)}
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteModel(model.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{user.email}</h3>
                          <p className="text-sm text-muted-foreground">
                            Usage: {user.dailyUsage}/{user.dailyLimit} today
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last used: {user.lastUsed}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            {user.plan}
                          </Badge>
                          <Select
                            value={user.plan}
                            onValueChange={(value: 'free' | 'basic' | 'pro' | 'premium') => 
                              handleUserPlanChange(user.id, value)
                            }
                          >
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
                            onClick={() => handleUserStatusChange(
                              user.id, 
                              user.status === 'active' ? 'banned' : 'active'
                            )}
                          >
                            {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Pricing Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricing.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <Switch
                          checked={plan.isActive}
                          onCheckedChange={(checked) => 
                            handleUpdatePricing(plan.id, { isActive: checked })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            value={plan.price}
                            onChange={(e) => 
                              handleUpdatePricing(plan.id, { price: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <Label>Daily Limit</Label>
                          <Input
                            type="number"
                            value={plan.dailyLimit}
                            onChange={(e) => 
                              handleUpdatePricing(plan.id, { dailyLimit: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Support Email</Label>
                  <div className="flex gap-2">
                    <Input
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    />
                    <Button onClick={handleContactUpdate} size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>WhatsApp Number</Label>
                  <div className="flex gap-2">
                    <Input
                      value={contactInfo.whatsapp}
                      onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                    />
                    <Button onClick={handleContactUpdate} size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Website</Label>
                  <div className="flex gap-2">
                    <Input
                      value={contactInfo.website}
                      onChange={(e) => setContactInfo({...contactInfo, website: e.target.value})}
                    />
                    <Button onClick={handleContactUpdate} size="sm">
                      <Globe className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">{users.length}</h3>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">{models.filter(m => m.isActive).length}</h3>
                    <p className="text-sm text-muted-foreground">Active Models</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">
                      {users.reduce((sum, user) => sum + user.dailyUsage, 0)}
                    </h3>
                    <p className="text-sm text-muted-foreground">Today's Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
