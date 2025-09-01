// src/sections/users/api/updateUserApi.ts
import axiosInstance, { endpoints } from 'src/lib/axios';

export function updateUserApi() {
  const url = endpoints.users.update;

  const updateUser = async (payload: {
    userId: string; // REQUIRED
    fName?: string;
    lName?: string;
    phone?: string; // NOTE: backend expects 'phone' (lowercase) per your spec
  }) => {
    if (!url) throw new Error('Missing endpoint');

    // Send JSON body, no multipart/form-data
    try {
      const res = await axiosInstance.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (err) {
      console.error('updateUserApi error', err);
      throw err;
    }
  };

  return { updateUser };
}
