
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  Eye, 
  Palette, 
  User, 
  Shield,
  Crown,
  Globe,
  CreditCard,
  Users,
  Cpu,
  Phone,
  Mail
} from 'lucide-react';
import TranscriptionSettings from '../components/TranscriptionSettings';
import AdminDashboard from '../components/AdminDashboard';

const Settings = () => {
  const { user } = useAuth();
  const { 
    notifications, setNotifications,
    saveTranscripts, setSaveTranscripts,
    defaultLanguage, setDefaultLanguage
  } = useSettings();
  
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleAdminLogin = () => {
    if (adminEmail === 'legendgamerz9999@gmail.com' && adminPassword === '@1S2i3f4') {
      setIsAdminLoggedIn(true);
      toast.success('Admin access granted');
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail('');
    setAdminPassword('');
    toast.info('Admin logged out');
  };

  if (isAdminLoggedIn) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your transcription experience and manage your account
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* User Info */}
            <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Email</Label>
                    <p className="text-sm text-muted-foreground">{user?.email || 'Not logged in'}</p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Free Plan
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Daily Transcriptions</Label>
                    <p className="text-sm text-muted-foreground">1 / 1 used today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Settings */}
            <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Default Language</Label>
                  <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about transcription status</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Save Transcription History</Label>
                    <p className="text-sm text-muted-foreground">Store transcripts locally for future access</p>
                  </div>
                  <Switch checked={saveTranscripts} onCheckedChange={setSaveTranscripts} />
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Plan */}
            <Card className="border-primary/20 shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                  Upgrade Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Unlock more transcriptions per day with our premium plans
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 bg-background/50">
                    <h3 className="font-semibold text-primary">Basic - $1</h3>
                    <p className="text-sm text-muted-foreground">5 transcriptions/day</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-background/50">
                    <h3 className="font-semibold text-primary">Pro - $2</h3>
                    <p className="text-sm text-muted-foreground">10 transcriptions/day</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-background/50">
                    <h3 className="font-semibold text-primary">Premium - $3</h3>
                    <p className="text-sm text-muted-foreground">20 transcriptions/day</p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Contact Us for Upgrade
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcription">
            <TranscriptionSettings />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card className="border-destructive/20 shadow-lg bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Shield className="h-5 w-5" />
                  Admin Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter admin email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                </div>
                <Button 
                  onClick={handleAdminLogin}
                  className="w-full"
                  variant="destructive"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Login as Admin
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
