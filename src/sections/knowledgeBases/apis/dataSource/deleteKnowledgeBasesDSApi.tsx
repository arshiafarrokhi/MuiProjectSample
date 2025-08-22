import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function deleteknowledgeBasesDS(url: string) {
  return axios({
    method: 'DELETE',
    url,
  });
}

export function useDeleteKnowledgeBasesDS(
  account_id: string,
  knowledgeBases_id: string | undefined,
  data_source_id: string
) {
  const url =
    account_id && knowledgeBases_id && data_source_id
      ? endpoints.knowledgeBases.dataSource.deleteDS
          .replace('{account_id}', account_id)
          .replace('{knowledge_base_id}', knowledgeBases_id)
          .replace('{data_source_id}', data_source_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, deleteknowledgeBasesDS);

  return {
    deleteKnowledgeBasesDS: () => trigger(undefined),
    isLoading: isMutating,
    data,
    error,
  };
}
