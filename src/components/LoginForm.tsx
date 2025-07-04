
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 relative z-10">
          {/* Logos above Welcome */}
          <div className="w-full pb-6">
            <div className="flex md:flex-row flex-col justify-center items-center md:space-x-6 md:space-y-0 space-y-4 p-2">
              <img 
                src="/lovable-uploads/13622cbc-bd03-4bdc-a031-240546ddc6d7.png" 
                alt="ONTO-DESIDE Logo" 
                className="h-20 object-contain opacity-80"
              />
              <img 
                src="/lovable-uploads/7182a64a-010a-47d2-8920-087a34127cb6.png" 
                alt="ESWC25 Logo" 
                className="h-20 object-contain opacity-80"
              />
              <img 
                src="/lovable-uploads/6ae6085c-e6e5-405c-9e01-6fbe7331b9e4.png" 
                alt="VSE Faculty Logo" 
                className="h-20 object-contain opacity-80"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-green-700 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="text-slate-600 text-lg">
              Sign in to access the Ontology Pattern Generator
            </p>
          </div>

          <Card className="shadow-2xl border border-gray-200 bg-white">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center text-slate-800">
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-green-400 focus:ring-green-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-green-400 focus:ring-green-400"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-600 to-green-600 hover:from-slate-700 hover:to-green-700 text-white font-medium py-2.5 transition-all duration-300 transform hover:scale-105"
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
        </div>
      </div>
    </div>
  );
};
