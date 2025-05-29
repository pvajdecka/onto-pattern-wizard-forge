
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
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-6 border-b border-gray-200 bg-white">
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/13622cbc-bd03-4bdc-a031-240546ddc6d7.png" 
            alt="ONTO-DESIDE Logo" 
            className="w-full h-12 object-contain"
          />
          <img 
            src="/lovable-uploads/6ae6085c-e6e5-405c-9e01-6fbe7331b9e4.png" 
            alt="VSE Faculty Logo" 
            className="w-full h-12 object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4 bg-white">
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
