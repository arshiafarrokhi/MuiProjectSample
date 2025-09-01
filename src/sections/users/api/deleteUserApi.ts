import axiosInstance, { endpoints } from 'src/lib/axios';

export function deleteUserApi() {
  const url = endpoints.users.delete;

  const deleteUser = async (userId: string) => {
    if (!url) throw new Error('Missing endpoint');

    try {
      const res = await axiosInstance.delete(url, { params: { userId } });
      return res.data;
    } catch (err) {
      console.error('deleteUserApi error', err);
      throw err;
    }
  };

  return { deleteUser };
}
