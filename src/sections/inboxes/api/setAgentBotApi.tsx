import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

async function updateAgentBot(url: string, { arg }: { arg: any }) {
  const payload = { bot_id: arg };

  return axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function useSetAgentBot(account_id: string, inbox_id: string) {
  const url =
    account_id && inbox_id
      ? endpoints.inboxes.setAgents
          .replace('{account_id}', account_id)
          .replace('{inbox_id}', inbox_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, updateAgentBot);

  return {
    setAgentBot: (botId?: any) => trigger(botId || null),
    isLoading: isMutating,
    data,
    error,
  };
}
