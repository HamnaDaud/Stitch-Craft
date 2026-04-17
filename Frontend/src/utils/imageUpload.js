// src/utils/imageUpload.js

// 1. PASTE YOUR IMGBB API KEY HERE
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 

export const uploadImage = async (file) => {
  if (!file) return null;

  // ImgBB requires the file to be in FormData
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error ? data.error.message : 'Upload failed');
    }

    // Return the display URL (direct link to the image)
    return data.data.url; 

  } catch (error) {
    console.error('Image Upload Error:', error);
    throw error;
  }
};