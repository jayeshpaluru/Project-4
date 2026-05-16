import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import { getApiErrorMessage, savePhotoUrl } from '../../lib/api';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadImageToCloudinary(file) {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed.');
  }

  return data.secure_url;
}

function AddPhotoDialog({ currentUserId, open, onClose }) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setErrorMessage('');
    }
  }, [open]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const uploadedUrl = await uploadImageToCloudinary(selectedFile);
      return savePhotoUrl(uploadedUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      onClose();
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, error.message || 'Photo upload failed.'));
    },
  });

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] || null);
    setErrorMessage('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage('Select an image to upload.');
      return;
    }

    setErrorMessage('');
    uploadMutation.mutate();
  }

  return (
    <Dialog fullWidth maxWidth="sm" onClose={uploadMutation.isPending ? undefined : onClose} open={open}>
      <DialogTitle>Add Photo</DialogTitle>
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Button component="label" disabled={uploadMutation.isPending} variant="outlined">
              Choose Image
              <input accept="image/*" hidden onChange={handleFileChange} type="file" />
            </Button>
            <Typography color="text.secondary" variant="body2">
              {selectedFile ? selectedFile.name : 'No file selected.'}
            </Typography>
            {uploadMutation.isPending ? (
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
                <CircularProgress size={22} />
                <Typography variant="body2">Uploading photo...</Typography>
              </Box>
            ) : null}
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={uploadMutation.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!selectedFile || uploadMutation.isPending} type="submit" variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

AddPhotoDialog.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddPhotoDialog;
