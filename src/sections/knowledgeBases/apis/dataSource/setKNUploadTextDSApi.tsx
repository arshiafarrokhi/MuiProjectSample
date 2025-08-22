import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function KNUploadTextDSApi(url: string, { arg }: { arg: any }) {
  return axios.post(url, arg, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function useSetKNUploadTextDSApi(account_id: string, knowledge_base_id: string | undefined) {
  const url =
    account_id && knowledge_base_id
      ? endpoints.knowledgeBases.dataSource.CreateDSText.replace(
          '{account_id}',
          account_id
        ).replace('{knowledge_base_id}', knowledge_base_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, KNUploadTextDSApi);

  return {
    useSetKNUploadTextDS: (UploadText?: any) => trigger(UploadText || null),
    isLoading: isMutating,
    data,
    error,
  };
}
