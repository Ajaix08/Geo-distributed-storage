import client from './client';

export const listFiles = () => client.get('/files').then((r) => r.data.files);

export const uploadFile = (file, region, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return client
    .post('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data', ...(region ? { 'x-region': region } : {}) },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
    .then((r) => r.data);
};

export const downloadFile = (id, filename) =>
  client.get(`/files/${id}/download`, { responseType: 'blob' }).then((r) => {
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });

export const getGatewayHealth = () => client.get('/gateway/health').then((r) => r.data);
