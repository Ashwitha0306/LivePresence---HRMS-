import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  CircularProgress 
} from '@mui/material';
import RequestCard from './RequestCard';
import axiosInstance from '../../api/axiosInstance';

const AdminChangeRequests = ({ mode }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/change-requests/');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (updatedRequest) => {
    setRequests(prev =>
      prev.map(req => (req.id === updatedRequest.id ? updatedRequest : req))
    );
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  return (
    <Box sx={{ p: 3, color: mode === 'dark' ? 'text.primary' : 'text.secondary' }}>
      <Typography variant="h6" gutterBottom>
        Employee Change Requests
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography component="span" sx={{ mr: 2 }}>
          Filter by status:
        </Typography>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{
            bgcolor: mode === 'dark' ? 'grey.800' : 'grey.100',
            color: mode === 'dark' ? 'text.primary' : 'text.secondary'
          }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : filteredRequests.length === 0 ? (
        <Typography>No change requests found.</Typography>
      ) : (
        <Box sx={{ '& > *': { mb: 2 } }}>
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              mode={mode}
              onStatusChange={handleStatusChange}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AdminChangeRequests;