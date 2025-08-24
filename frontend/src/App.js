import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Badge } from "./components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { TicketIcon, UserIcon, ClipboardListIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, ExternalLinkIcon } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const MONDAY_FORM_URL = "https://forms.monday.com/forms/a4a0b62dd139cdd5e5976c5f02ff6879?r=use1";

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ticketsRes, specialistsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/tickets?limit=50`),
        axios.get(`${API}/specialists`)
      ]);
      
      setStats(statsRes.data);
      setTickets(ticketsRes.data);
      setSpecialists(specialistsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status, assignedTo = null) => {
    try {
      const updateData = { status };
      if (assignedTo) updateData.assigned_to = assignedTo;
      
      await axios.put(`${API}/tickets/${ticketId}`, updateData);
      toast.success('Ticket updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      received: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800"
    };
    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return (
      <Badge className={priorityColors[priority] || "bg-gray-100 text-gray-800"}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const openMondayForm = () => {
    window.open(MONDAY_FORM_URL, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img 
                src="https://res.cloudinary.com/monday-platform/image/upload/v1679835967/board_views_images/logos/1679835966727_f4639dd5-bf25-3f92-dae2-9d23763f3027.png" 
                alt="Renewal by Andersen" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IT Support Dashboard</h1>
                <p className="text-gray-600">Renewal by Andersen</p>
              </div>
            </div>
            <Button 
              onClick={openMondayForm}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              <span>Submit New Ticket</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tickets</CardTitle>
              <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_tickets_today || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Queue</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.tickets_in_queue || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_tickets_week || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_tickets_month || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Specialist Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tickets by Specialist</CardTitle>
              <CardDescription>Current workload distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialists.map(specialist => (
                  <div key={specialist.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{specialist.name}</p>
                        <p className="text-sm text-gray-500">{specialist.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {stats?.tickets_by_specialist[specialist.name] || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>Tickets by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats?.tickets_by_status || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(status)}
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Latest support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.slice(0, 10).map(ticket => {
                  const assignedSpecialist = specialists.find(s => s.id === ticket.assigned_to);
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono">{ticket.ticket_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                      <TableCell>{ticket.requester_name}</TableCell>
                      <TableCell className="capitalize">{ticket.category}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{assignedSpecialist?.name || 'Unassigned'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {ticket.status === 'received' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTicketStatus(ticket.id, 'in_progress', specialists[0]?.id)}
                            >
                              Start
                            </Button>
                          )}
                          {ticket.status === 'in_progress' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Made by ISC IT Department
        </div>
      </div>
    </div>
  );
};

// Ticket Status Checker Component  
const TicketStatus = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get ticket number from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    if (ticketParam) {
      setTicketNumber(ticketParam);
      checkTicketStatus(ticketParam);
    }
  }, []);

  const checkTicketStatus = async (number = ticketNumber) => {
    if (!number) return;
    
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const response = await axios.get(`${API}/tickets/${number}`);
      setTicket(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Ticket not found. Please check the ticket number and try again.');
      } else {
        setError('Error checking ticket status. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received':
        return <ClockIcon className="w-8 h-8 text-blue-500" />;
      case 'in_progress':
        return <AlertCircleIcon className="w-8 h-8 text-yellow-500" />;
      case 'resolved':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      default:
        return <ClipboardListIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const openMondayForm = () => {
    window.open(MONDAY_FORM_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">← Dashboard</Button>
              </Link>
              <img 
                src="https://res.cloudinary.com/monday-platform/image/upload/v1679835967/board_views_images/logos/1679835966727_f4639dd5-bf25-3f92-dae2-9d23763f3027.png" 
                alt="Renewal by Andersen" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Check Ticket Status</h1>
                <p className="text-gray-600">Renewal by Andersen IT Support</p>
              </div>
            </div>
            <Button 
              onClick={openMondayForm}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              <span>Submit New Ticket</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status Lookup</CardTitle>
            <CardDescription>
              Enter your ticket number to check the current status of your support request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <Input
                placeholder="Enter ticket number (e.g., 202501010001)"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => checkTicketStatus()}
                disabled={loading || !ticketNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {ticket && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                  {getStatusIcon(ticket.status)}
                  <div>
                    <h3 className="text-xl font-semibold">Ticket #{ticket.ticket_number}</h3>
                    <p className="text-gray-600">{ticket.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge className={
                        ticket.status === 'received' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <div className="mt-1">
                      <Badge className={
                        ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                    <p className="mt-1 capitalize">{ticket.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                    <p className="mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="mt-1 text-gray-800">{ticket.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Status Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Ticket received and logged</span>
                    </div>
                    {ticket.status !== 'received' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Assigned to technician and in progress</span>
                      </div>
                    )}
                    {ticket.status === 'resolved' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Issue resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
              Made by ISC IT Department
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/status" element={<TicketStatus />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;