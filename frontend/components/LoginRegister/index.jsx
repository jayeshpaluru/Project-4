/* eslint-disable react/jsx-no-bind */
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  getApiErrorMessage,
  loginUser,
  registerUser,
} from '../../lib/api';

import './styles.css';

const initialLoginForm = {
  login_name: '',
  password: '',
};

const initialRegisterForm = {
  login_name: '',
  password: '',
  first_name: '',
  last_name: '',
  location: '',
  description: '',
  occupation: '',
};

function LoginRegister() {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  function updateLoginField(event) {
    setLoginForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  }

  function updateRegisterField(event) {
    setRegisterForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  }

  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate(`/users/${user._id}`);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (regForm) => {
      await registerUser(regForm);
      return loginUser({
        login_name: regForm.login_name,
        password: regForm.password,
      });
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', user._id] });
      navigate(`/users/${user._id}`);
    },
  });

  return (
    <Box className="login-register">
      <Typography gutterBottom variant="h4">
        Photo Share
      </Typography>
      <Typography color="text.secondary" variant="body1">
        Sign in or create an account to browse photos.
      </Typography>

      <Grid container spacing={4} className="login-register-grid">
        <Grid item xs={12} md={5}>
          <Stack component="form" spacing={2} onSubmit={(event) => { event.preventDefault(); loginMutation.mutate(loginForm); }}>
            <Typography variant="h5">Login</Typography>
            {loginMutation.isError ? <Alert severity="error">{getApiErrorMessage(loginMutation.error, 'Login failed.')}</Alert> : null}
            <TextField
              label="Login name"
              name="login_name"
              onChange={updateLoginField}
              required
              value={loginForm.login_name}
            />
            <TextField
              label="Password"
              name="password"
              onChange={updateLoginField}
              required
              type="password"
              value={loginForm.password}
            />
            <Button
              disabled={loginMutation.isLoading}
              type="submit"
              variant="contained"
            >
              {loginMutation.isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={1}>
          <Divider className="login-register-divider" orientation="vertical" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack component="form" spacing={2} onSubmit={(event) => { event.preventDefault(); registerMutation.mutate(registerForm); }}>
            <Typography variant="h5">Register</Typography>
            {registerMutation.isError ? <Alert severity="error">{getApiErrorMessage(registerMutation.error, 'Registration failed.')}</Alert> : null}
            <TextField
              label="Login name"
              name="login_name"
              onChange={updateRegisterField}
              required
              value={registerForm.login_name}
            />
            <TextField
              label="Password"
              name="password"
              onChange={updateRegisterField}
              required
              type="password"
              value={registerForm.password}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First name"
                  name="first_name"
                  onChange={updateRegisterField}
                  required
                  value={registerForm.first_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last name"
                  name="last_name"
                  onChange={updateRegisterField}
                  required
                  value={registerForm.last_name}
                />
              </Grid>
            </Grid>
            <TextField
              label="Location"
              name="location"
              onChange={updateRegisterField}
              value={registerForm.location}
            />
            <TextField
              label="Description"
              multiline
              name="description"
              onChange={updateRegisterField}
              rows={3}
              value={registerForm.description}
            />
            <TextField
              label="Occupation"
              name="occupation"
              onChange={updateRegisterField}
              value={registerForm.occupation}
            />
            <Button
              disabled={registerMutation.isLoading}
              type="submit"
              variant="contained"
            >
              {registerMutation.isLoading ? 'Creating account...' : 'Register'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default LoginRegister;
