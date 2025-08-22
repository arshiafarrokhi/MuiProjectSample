import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function KNUploadFileDSApi(url: string, { arg }: { arg: any }) {
  return axios.post(url, arg);
}

export function useSetKNUploadFileDSApi(account_id: string, knowledge_base_id: string | undefined) {
  const url =
    account_id && knowledge_base_id
      ? endpoints.knowledgeBases.dataSource.CreateDSFile.replace(
          '{account_id}',
          account_id
        ).replace('{knowledge_base_id}', knowledge_base_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, KNUploadFileDSApi);

  return {
    useSetKNUploadFileDS: (UploadFile?: any) => trigger(UploadFile || null),
    isLoading: isMutating,
    data,
    error,
  };
}
