import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function deleteknowledgeBases(url: string) {
  return axios({
    method: 'DELETE',
    url,
  });
}

export function useDeleteKnowledgeBases(account_id: string, knowledgeBases_id: string) {
  const url =
    account_id && knowledgeBases_id
      ? endpoints.knowledgeBases.deleteKnowledgeBases
          .replace('{account_id}', account_id)
          .replace('{knowledge_base_id}', knowledgeBases_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, deleteknowledgeBases);

  return {
    deleteKnowledgeBases: () => trigger(undefined),
    isLoading: isMutating,
    data,
    error,
  };
}
