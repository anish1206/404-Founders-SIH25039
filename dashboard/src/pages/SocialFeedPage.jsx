// /dashboard/src/pages/SocialFeedPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Container, Typography, CircularProgress, Alert, Card, CardContent, CardActions, Button, Link, Box } from '@mui/material';

const SocialFeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/social/posts`;
      const response = await axios.get(apiEndpoint);
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch social media posts.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTriggerScrape = async () => {
    setIsScraping(true);
    setError('');
    try {
      const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/social/scrape`;
      await axios.post(apiEndpoint);
      // Wait a few seconds for the scraper to finish, then refresh the data
      setTimeout(() => {
        fetchPosts();
        setIsScraping(false);
      }, 5000); // 5-second delay
    } catch (err) {
      setError('Failed to trigger new scrape.');
      setIsScraping(false);
    }
  };

  const renderContent = () => {
    if (loading) return <CircularProgress />;
    if (posts.length === 0) return <Typography>No relevant social media posts found.</Typography>;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.map(post => (
          <Card key={post._id} variant="outlined">
            <CardContent>
              <Typography variant="h6" component="div">
                {post.title}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {post.source} - {new Date(post.publishedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">{post.contentSnippet}...</Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href={post.url} target="_blank" rel="noopener noreferrer">
                View Original Post
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Social Media Feed
          </Typography>
          <Button variant="contained" onClick={handleTriggerScrape} disabled={isScraping}>
            {isScraping ? <CircularProgress size={24} /> : 'Refresh Feeds'}
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {renderContent()}
      </Container>
    </Layout>
  );
};

export default SocialFeedPage;