import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

import type { AddAgentBotArgsType } from '../types';

async function updateCreateBot(url: string, { arg }: { arg: any }) {
  return axios.post(url, arg, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function useSetCreateBot(account_id: string) {
  const url = account_id ? endpoints.bots.getCreateBots.replace('{account_id}', account_id) : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, updateCreateBot);

  return {
    setCreateBot: (botId?: AddAgentBotArgsType['arg']) => trigger(botId || undefined),
    isLoading: isMutating,
    data,
    error,
  };
}
