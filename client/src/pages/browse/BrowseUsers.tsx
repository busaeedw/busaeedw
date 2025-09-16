import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Search, Filter, Calendar, Mail } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinedDate?: string;
  eventsAttended?: number;
}

export default function BrowseUsers() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'attendee', label: 'Attendee' },
    { value: 'organizer', label: 'Organizer' },
    { value: 'service_provider', label: 'Service Provider' },
    { value: 'admin', label: 'Admin' },
  ];

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      organizer: 'bg-blue-100 text-blue-700',
      service_provider: 'bg-green-100 text-green-700',
      attendee: 'bg-gray-100 text-gray-700',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title-users">
            {t('nav.browse.users')}
          </h1>
          <p className="text-gray-600">
            Browse platform users and connect with the community
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-users-input"
              />
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger data-testid="select-user-role">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center" data-testid="filter-users-button">
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="bg-white p-6 h-48 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded mb-2 w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user, index) => (
              <Card key={user.id} className="bg-white p-6 hover:shadow-lg transition-shadow" data-testid={`user-card-${index}`}>
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" data-testid={`user-name-${index}`}>
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="truncate" data-testid={`user-email-${index}`}>
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getRoleBadgeColor(user.role)} data-testid={`user-role-${index}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {user.eventsAttended || 0} events
                    </span>
                  </div>
                  
                  {user.joinedDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" data-testid={`user-profile-${index}`}>
                    View Profile
                  </Button>
                  <Button size="sm" className="bg-saudi-green hover:bg-saudi-green/90" data-testid={`user-message-${index}`}>
                    Message
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p>Total users: {filteredUsers.length}</p>
        </div>
      </main>
    </div>
  );
}