import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import {
  Link as RouterLink,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import api, {
  addComment,
  getApiErrorMessage,
  togglePhotoLike,
} from '../../lib/api';

import './styles.css';

function formatDateTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

function UserPhotos({ userId: userIdProp }) {
  const { userId: userIdParam } = useParams();
  const { currentUser } = useOutletContext();
  const userId = userIdProp || userIdParam;

  const [commentTexts, setCommentTexts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});

  const { data: photos = [], isLoading: loading, error } = useQuery({
    queryKey: ['photos', userId],
    queryFn: () => api.get(`/photosOfUser/${userId}`).then((res) => res.data),
  });

  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: (_, { photoId }) => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
      const updateComments = { ...commentTexts, [photoId]: '' };
      setCommentTexts(updateComments);
      const updateErrors = { ...commentErrors, [photoId]: '' };
      setCommentErrors(updateErrors);
    },
    onError: (err, { photoId }) => {
      const updateErrors = { ...commentErrors, [photoId]: getApiErrorMessage(err) };
      setCommentErrors(updateErrors);
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: togglePhotoLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
    },
  });

  function handleSubmit(photoId) {
    addCommentMutation.mutate({ photoId, comment: commentTexts[photoId] });
  }

  function handleAddComment(photoId, newComment) {
    const updateComments = { ...commentTexts, [photoId]: newComment };
    setCommentTexts(updateComments);
  }

  if (loading) {
    return (
      <div className="user-photos-state">
        <CircularProgress size={32} />
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">Unable to load photos for this user.</Alert>;
  }

  if (photos.length === 0) {
    return <Alert severity="info">This user has not posted any photos yet.</Alert>;
  }

  return (
    <Stack spacing={3}>
      {photos.map((photo) => (
        <Card key={photo._id} className="user-photo-card" elevation={2}>
          <CardMedia
            component="img"
            image={photo.file_name}
            alt={`Uploaded by user ${photo.user_id}`}
          />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Photo</Typography>
                <Typography color="text.secondary" variant="body2">
                  Posted
                  {' '}
                  {formatDateTime(photo.date_time)}
                </Typography>
              </Box>

              <Box className="user-photo-like-row">
                <Button
                  color={photo.likes?.includes(currentUser?._id) ? 'secondary' : 'primary'}
                  disabled={toggleLikeMutation.isPending}
                  onClick={() => toggleLikeMutation.mutate(photo._id)}
                  variant={photo.likes?.includes(currentUser?._id) ? 'contained' : 'outlined'}
                >
                  {photo.likes?.includes(currentUser?._id) ? 'Unlike' : 'Like'}
                </Button>
                <Typography color="text.secondary" variant="body2">
                  {photo.likes?.length || 0}
                  {' '}
                  {photo.likes?.length === 1 ? 'like' : 'likes'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography gutterBottom variant="subtitle1">
                  Comments
                </Typography>
                {photo.comments?.length ? (
                  <List className="user-photo-comments-list" disablePadding>
                    {photo.comments.map((comment) => (
                      <ListItem
                        key={comment._id}
                        className="user-photo-comment"
                        disableGutters
                      >
                        <Stack spacing={0.5}>
                          <Typography color="text.secondary" variant="caption">
                            {formatDateTime(comment.date_time)}
                          </Typography>
                          <Typography component="div" variant="body2">
                            <Box
                              component={RouterLink}
                              to={`/users/${comment.user._id}`}
                              className="user-photo-comment-link"
                            >
                              {comment.user.first_name}
                              {' '}
                              {comment.user.last_name}
                            </Box>
                            {' '}
                            {comment.comment}
                          </Typography>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    No comments yet.
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box className="user-photo-comment-form">
                <TextField
                  className="user-photo-comment-input"
                  placeholder="Add a comment..."
                  fullWidth
                  multiline
                  minRows={2}
                  value={commentTexts[photo._id]}
                  onChange={(event) => handleAddComment(photo._id, event.target.value)}
                />
                <Box className="user-photo-comment-actions">
                  <Button
                    disabled={addCommentMutation.isPending}
                    onClick={() => handleSubmit(photo._id)}
                    variant="contained"
                  >
                    {addCommentMutation.isPending ? 'Posting...' : 'Post comment'}
                  </Button>
                </Box>
                {commentErrors[photo._id] && (
                  <Alert className="user-photo-comment-error" severity="error">
                    {commentErrors[photo._id]}
                  </Alert>
                )}
              </Box>

            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string,
};

export default UserPhotos;
