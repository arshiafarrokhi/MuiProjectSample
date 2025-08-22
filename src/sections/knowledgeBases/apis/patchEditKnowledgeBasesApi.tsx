import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function updateAgentKnowledgeBases(url: string, { arg }: { arg: any }) {
  return axios.patch(url, arg, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function usePatchEditKnowledgeBasesApi(
  account_id: string,
  knowledge_base_id: string | undefined
) {
  const url =
    account_id && knowledge_base_id
      ? endpoints.knowledgeBases.patchDefaultEditKnowledgeBases
          .replace('{account_id}', account_id)
          .replace('{knowledge_base_id}', knowledge_base_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, updateAgentKnowledgeBases);

  return {
    setPatchEditKnowledgeBases: (KnowledgeBasesId?: any) => trigger(KnowledgeBasesId || null),
    isLoading: isMutating,
    data,
    error,
  };
}
