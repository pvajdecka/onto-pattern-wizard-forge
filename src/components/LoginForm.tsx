
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, User, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (username: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if ((username === 'peter' || username === 'vojtech') && password === 'VSE') {
      onLogin(username);
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Logo background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="text-green-600 text-[20rem] font-bold">
          ONTO-DESIDE
        </div>
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header with logos */}
        <div className="text-center space-y-6">
          <div className="flex justify-center space-x-8 mb-8">
            <img 
              src="/lovable-uploads/45e896f0-0815-4fa3-8746-42073724881f.png" 
              alt="ONTO-DESIDE Logo" 
              className="h-16 object-contain"
            />
            <img 
              src="/lovable-uploads/b7c077ba-3834-426a-969e-196a9a29ea31.png" 
              alt="VSE Faculty Logo" 
              className="h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to access the Ontology Pattern Generator
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2.5 transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          Demo credentials: peter/VSE or vojtech/VSE
        </div>
      </div>
    </div>
  );
};
