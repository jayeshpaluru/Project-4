/* eslint-disable react/jsx-no-bind */
import React, { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import {
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useOutletContext,
  useParams,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import './styles/main.css';
import TopBar from './components/TopBar';
import AddPhotoDialog from './components/AddPhotoDialog';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import LoginRegister from './components/LoginRegister';
import { getCurrentUser, logoutUser } from './lib/api';

// create instance of queryClient
const queryClient = new QueryClient();

function Home() {
  return (
    <Typography variant="body1">
      Welcome to your photosharing app! This
      {' '}
      <a href="https://mui.com/components/paper/" rel="noreferrer" target="_blank">Paper</a>
      {' '}
      component displays the main content of the application. The
      {/* {sm={9}} */}
      {' '}
      prop in the
      {' '}
      <a href="https://mui.com/components/grid/" rel="noreferrer" target="_blank">Grid</a>
      {' '}
      item
      component makes it responsively display 9/12 of the
      window. The Routes definitions enables us to conditionally
      render different components to this part of the screen.
      There is nothing specific to display here. Use your creativity and show some interesting content here.
    </Typography>
  );
}

function UserDetailRoute() {
  const { userId } = useParams();
  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return <UserPhotos userId={userId} />;
}

function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClientInstance = useQueryClient();
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  const { data: currentUser, isLoading: authLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      setIsAddPhotoOpen(false);
      queryClientInstance.invalidateQueries({ queryKey: ['currentUser'] });
      queryClientInstance.invalidateQueries({ queryKey: ['users'] });
      queryClientInstance.invalidateQueries({ queryKey: ['user'] });
      queryClientInstance.invalidateQueries({ queryKey: ['photos'] });
      navigate('/login-register');
    },
  });

  if (authLoading) {
    return (
      <div className="main-loading">
        <CircularProgress size={36} />
      </div>
    );
  }

  if (!currentUser && location.pathname !== '/login-register') {
    return <Navigate to="/login-register" replace />;
  }

  if (currentUser && location.pathname === '/login-register') {
    return <Navigate to={`/users/${currentUser._id}`} replace />;
  }

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar
            currentUser={currentUser}
            onLogout={logoutMutation.mutate}
            onOpenAddPhoto={() => setIsAddPhotoOpen(true)}
          />
        </Grid>
        <div className="main-topbar-buffer" />
        {currentUser ? (
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>
        ) : null}
        <Grid item sm={currentUser ? 9 : 12}>
          <Paper className="main-grid-item">
            <Outlet context={{ currentUser }} />
          </Paper>
        </Grid>
      </Grid>
      {currentUser ? (
        <AddPhotoDialog
          currentUserId={currentUser._id}
          onClose={() => setIsAddPhotoOpen(false)}
          open={isAddPhotoOpen}
        />
      ) : null}
    </div>
  );
}

function LoginRegisterRoute() {
  return <LoginRegister />;
}

function UserLayout() {
  const outletContext = useOutletContext();
  return <Outlet context={outletContext} />;
}

const router = createBrowserRouter([
  {
    path: '/index.html',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login-register', element: <LoginRegisterRoute /> },

      { path: 'users', element: <UserList /> },

      {
        path: 'users/:userId',
        element: <UserLayout />,
        children: [
          { index: true, element: <UserDetailRoute /> },
          { path: 'photos', element: <UserPhotosRoute /> },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
