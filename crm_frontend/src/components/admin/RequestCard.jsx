import React, { useState } from 'react';
import { 
  Box,
  Typography,
  Button,
  Chip,
  Divider
} from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const RequestCard = ({ request, onStatusChange, mode }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (newStatus) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.patch(
        `admin/change-requests/${request.id}/`,
        {
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      onStatusChange(response.data);
    } catch (error) {
      console.error(`Error updating request ${request.id}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch(request.status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        mb: 2,
        border: '1px solid',
        borderColor: mode === 'dark' ? 'grey.700' : 'grey.300',
        borderRadius: 2,
        bgcolor: mode === 'dark' ? 'grey.900' : 'background.paper',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Field: {request.field_name}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <Typography><strong>Old:</strong> {request.old_value}</Typography>
        <Typography><strong>New:</strong> {request.new_value}</Typography>
      </Box>
      
      <Typography paragraph><strong>Reason:</strong> {request.reason}</Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption">
          Requested on: {new Date(request.requested_at).toLocaleString()}
        </Typography>
        <Chip 
          label={request.status} 
          color={getStatusColor()}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>

      {request.status === 'pending' && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleAction('approved')}
            disabled={loading}
            size="small"
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAction('rejected')}
            disabled={loading}
            size="small"
          >
            Reject
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RequestCard;