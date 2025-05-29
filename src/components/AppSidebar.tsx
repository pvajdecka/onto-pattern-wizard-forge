
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { ModelParameters } from '@/components/ModelParameters';

export const AppSidebar = () => {
  return (
    <Sidebar className="border-r border-slate-200 bg-gradient-to-b from-slate-100 via-blue-50 to-cyan-50">
      <SidebarHeader className="p-6 border-b border-slate-200 bg-white/40 backdrop-blur-sm">
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/45e896f0-0815-4fa3-8746-42073724881f.png" 
            alt="ONTO-DESIDE Logo" 
            className="w-full h-12 object-contain"
          />
          <img 
            src="/lovable-uploads/b7c077ba-3834-426a-969e-196a9a29ea31.png" 
            alt="VSE Faculty Logo" 
            className="w-full h-12 object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-700 font-semibold">
            Model Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ModelParameters />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
