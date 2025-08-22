import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function deleteAgentBot(url: string) {
  return axios({
    method: 'DELETE',
    url,
  });
}

export function useDeleteBot(account_id: string, bot_id: string) {
  const url =
    account_id && bot_id
      ? endpoints.bots.deleteBot.replace('{account_id}', account_id).replace('{bot_id}', bot_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, deleteAgentBot);

  return {
    deleteBot: () => trigger(undefined),
    isLoading: isMutating,
    data,
    error,
  };
}
