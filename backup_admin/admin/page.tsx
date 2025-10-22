"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Menu, Users, BarChart3, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const AdminPage: React.FC = () => {
  const router = useRouter();

  const adminOptions = [
    {
      title: "Menu Management",
      description: "Manage menu items, categories, and promotions",
      icon: Menu,
      path: "/admin/menu",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Django Admin",
      description: "Full Django admin panel for advanced management",
      icon: Settings,
      path: "http://localhost:8000/admin/",
      external: true,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      path: "/admin/users",
      disabled: true,
      color: "bg-gray-400"
    },
    {
      title: "Analytics",
      description: "View reports and analytics",
      icon: BarChart3,
      path: "/admin/analytics",
      disabled: true,
      color: "bg-gray-400"
    }
  ];

  const handleNavigation = (option: any) => {
    if (option.disabled) return;
    
    if (option.external) {
      window.open(option.path, '_blank');
    } else {
      router.push(option.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your restaurant system from here
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                onClick={() => handleNavigation(option)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white ${option.color}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  {option.disabled ? (
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${option.color} text-white`}
                      onClick={() => handleNavigation(option)}
                    >
                      {option.external ? (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Django Admin
                        </>
                      ) : (
                        'Open'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Quick Access</h3>
              <p className="text-gray-600 mb-4">
                Need to go back to the main menu?
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/menu')}
                className="mr-4"
              >
                Back to Menu
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
              >
                Home Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;