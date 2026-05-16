import React from 'react';
import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

import api from '../../lib/api';

import './styles.css';

function UserDetail({ userId: userIdProp }) {
  const { userId: userIdParam } = useParams();
  const userId = userIdProp || userIdParam;

  const { data: user, isLoading: loading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.get(`/user/${userId}`).then((res) => res.data),
  });

  if (loading) {
    return (
      <div className="user-detail-state">
        <CircularProgress size={32} />
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">Unable to load this user.</Alert>;
  }

  if (!user) {
    return <Alert severity="info">User not found.</Alert>;
  }

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <Stack className="user-detail" spacing={3}>
      <Box>
        <Typography gutterBottom variant="h4">
          {fullName}
        </Typography>
        <Typography color="text.secondary" variant="subtitle1">
          {user.occupation}
        </Typography>
      </Box>

      <Divider />

      <Stack spacing={2}>
        <Box>
          <Typography className="user-detail-label" variant="subtitle2">
            Location
          </Typography>
          <Typography variant="body1">{user.location}</Typography>
        </Box>

        <Box>
          <Typography className="user-detail-label" variant="subtitle2">
            Description
          </Typography>
          <Typography variant="body1">{user.description}</Typography>
        </Box>
      </Stack>

      <Box>
        <Button
          component={RouterLink}
          to={`/users/${user._id}/photos`}
          variant="contained"
        >
          View Photos
        </Button>
      </Box>
    </Stack>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string,
};

export default UserDetail;
