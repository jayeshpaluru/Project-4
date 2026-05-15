import React from 'react';
import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Toolbar,
  Typography,
} from '@mui/material';
import { useLocation, matchPath } from 'react-router-dom';

import api from '../../lib/api';

import './styles.css';

function TopBar({ currentUser, onLogout, onOpenAddPhoto }) {
  const location = useLocation();

  const photoMatch = matchPath('/users/:userId/photos', location.pathname);
  const detailMatch = matchPath('/users/:userId', location.pathname);
  const matchedUserId = photoMatch?.params.userId || detailMatch?.params.userId;

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['user', matchedUserId],
    queryFn: () => api.get(`/user/${matchedUserId}`).then((res) => res.data),
    enabled: !!matchedUserId,
  });

  let title = 'Photo Share';
  if (currentUser) {
    if (matchedUserId) {
      if (user) {
        const fullName = `${user.first_name} ${user.last_name}`;
        title = photoMatch ? `Photos of ${fullName}` : fullName;
      } else if (!loading) {
        title = 'User not found';
      } else {
        title = location.pathname === '/users' ? 'Users' : 'Browse the photo collection';
      }
    }
  }

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h6" color="inherit">
          Jayesh Paluru
        </Typography>
        <Box className="topbar-spacer" />
        {loading ? <CircularProgress color="inherit" size={22} /> : null}
        <Typography className="topbar-context" variant="h6" color="inherit">
          {title}
        </Typography>
        {currentUser ? (
          <>
            <Button color="inherit" onClick={onOpenAddPhoto}>
              Add Photo
            </Button>
            <Typography className="topbar-greeting" variant="body1" color="inherit">
              Hi
              {' '}
              {currentUser.first_name}
            </Typography>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}

TopBar.propTypes = {
  currentUser: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
  onOpenAddPhoto: PropTypes.func.isRequired,
};

export default TopBar;
