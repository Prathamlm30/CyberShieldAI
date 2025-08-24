import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Shield, 
  Settings, 
  Save,
  Crown,
  Zap,
  Activity,
  Clock,
  BarChart3
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  total_scans: number;
  threats_blocked: number;
  subscription_tier: string;
  created_at: string;
}

export function EliteProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User'
          })
          .select()
          .single();

        if (createError) throw createError;
        if (newProfile) {
          setProfile(newProfile);
          setDisplayName(newProfile.display_name || '');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, display_name: displayName.trim() || null } : prev);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Unable to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Badge className="cyber-glow"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'pro':
        return <Badge variant="warning"><Zap className="w-3 h-3 mr-1" />Pro</Badge>;
      default:
        return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />Free</Badge>;
    }
  };

  const calculateSecurityScore = () => {
    if (!profile) return 0;
    const scansWeight = Math.min(profile.total_scans * 2, 50);
    const threatsWeight = Math.min(profile.threats_blocked * 5, 30);
    const accountAge = Math.min(
      Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      20
    );
    return Math.min(scansWeight + threatsWeight + accountAge, 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-glow">Profile</h1>
            <p className="text-muted-foreground">Account settings and security overview</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bento-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-glow">Profile</h1>
          <p className="text-muted-foreground">Account settings and security overview</p>
        </div>
        {profile && getTierBadge(profile.subscription_tier)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {profile?.display_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Member since {profile ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="glass opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed from this interface
                </p>
              </div>

              <Button 
                onClick={updateProfile} 
                disabled={updating}
                className="w-full cyber-glow"
              >
                {updating ? 'Saving...' : 'Save Changes'}
                <Save className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Overview */}
        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="w-5 h-5 text-primary" />
              Security Overview
            </CardTitle>
            <CardDescription>Your cybersecurity activity and achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${calculateSecurityScore()}, 100`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{calculateSecurityScore()}</div>
                    <div className="text-xs text-muted-foreground">Security Score</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Based on your activity and protection level</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-lg font-bold text-foreground count-up">
                  {profile?.total_scans || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Scans</div>
              </div>

              <div className="glass rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <div className="text-lg font-bold text-foreground count-up">
                  {profile?.threats_blocked || 0}
                </div>
                <div className="text-xs text-muted-foreground">Threats Blocked</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Account Status</h4>
              
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Protection Status</span>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Subscription</span>
                </div>
                {profile && getTierBadge(profile.subscription_tier)}
              </div>

              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Two-Factor Auth</span>
                </div>
                <Badge variant="secondary">Not Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bento-card glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest security interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 glass rounded-lg">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Account Created</p>
                <p className="text-xs text-muted-foreground">
                  Welcome to CyberShield AI! Your digital protection journey begins now.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile ? new Date(profile.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            {profile && profile.total_scans > 0 && (
              <div className="flex items-center gap-3 p-3 glass rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Security Scans Performed</p>
                  <p className="text-xs text-muted-foreground">
                    You've completed {profile.total_scans} security scans to protect your digital assets.
                  </p>
                </div>
              </div>
            )}

            {(!profile || profile.total_scans === 0) && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">Start using CyberShield AI to see your activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}