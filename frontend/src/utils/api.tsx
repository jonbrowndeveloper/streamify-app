import axios from 'axios';
import { Video } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchVideos = async (): Promise<Video[]> => {
  const response = await axios.get(`${API_URL}/api/videos`);
  return response.data;
};

export const createVideo = async (video: Partial<Video>): Promise<Video> => {
  const response = await axios.post(`${API_URL}/api/videos`, video);
  return response.data;
};

export const updateVideo = async (id: string, video: Partial<Video>): Promise<Video> => {
  const response = await axios.put(`${API_URL}/api/videos/${id}`, video);
  return response.data;
};

export const deleteVideo = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/videos/${id}`);
};

export const fetchOmdbData = async (): Promise<{ message: string }> => {
  const response = await axios.get(`${API_URL}/api/omdb`);
  return response.data;
};

export const scanVideos = async (): Promise<{ message: string; videosFound: number; videosInsertedToDB: number; errors: any[] }> => {
  const response = await axios.post(`${API_URL}/api/scan`);
  return response.data;
};