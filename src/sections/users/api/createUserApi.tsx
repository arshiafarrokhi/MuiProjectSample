import axiosInstance, { endpoints } from 'src/lib/axios';

export function createUserApi() {
  const url = endpoints.users.create; // 'Users/AddNewUser'

  const setAgentBot = async (payload: {
    Phone?: string;
    Password?: string;
    fName?: string;
    lName?: string;
    Avatar?: File | null;
  }) => {
    if (!url) throw new Error('Missing endpoint');

    const form = new FormData();
    if (payload.Phone) form.append('Phone', payload.Phone);
    if (payload.Password) form.append('Password', payload.Password);
    if (payload.fName) form.append('fName', payload.fName);
    if (payload.lName) form.append('lName', payload.lName);
    if (payload.Avatar) form.append('Avatar', payload.Avatar as File);

    try {
      const res = await axiosInstance.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      console.error('createUserApi error', err);
      throw err;
    }
  };

  return { setAgentBot };
}
