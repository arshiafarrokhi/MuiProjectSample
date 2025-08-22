import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function updateCreateKnowledgeBases(url: string, { arg }: { arg: any }) {
  return axios.post(url, arg, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function useSetCreateKnowledgeBases(account_id: string) {
  const url = account_id
    ? endpoints.knowledgeBases.getCreateKnowledgeBases.replace('{account_id}', account_id)
    : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, updateCreateKnowledgeBases);

  return {
    setCreateKnowledgeBases: (knowledgeBasesId?: any) => trigger(knowledgeBasesId || null),
    isLoading: isMutating,
    data,
    error,
  };
}
