/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios'

const client = axios.create({ baseURL: process.env.REACT_APP_API_URL })

const uploadTemplate = async (formData) => {
  try {
    const result = await client.post(
      '/docx/upload-template',
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return { 
      success: true,
      data: result.data
    }
  } catch (error) {
    return { 
      success: false,
      error: error?.response?.data?.error || 'Something went wrong!'
    }
  }
  
}

const generateDocument = async (formData) => {
  try {
    const result =  await client.post(
      '/docx/generate',
      formData
    );
    return { 
      success: true,
      data: result.data
    }
  } catch (error) {
    console.log({ error })
    return { 
      success: false,
      error: error?.response?.data?.error || 'Something went wrong!'
    }
  }
}

export default {
  uploadTemplate,
  generateDocument
}
