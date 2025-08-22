import useSWRMutation from 'swr/mutation';

import axios, { endpoints } from 'src/lib/axios';

import type { UpdateAgentBotArgsType } from '../types';

async function updateAgentBot(url: string, { arg }: { arg: any }) {
  return axios.patch(url, arg, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function usePatchEditBot(account_id: string, bot_id: string | undefined) {
  const url =
    account_id && bot_id
      ? endpoints.bots.patchDefaultEditBot
          .replace('{account_id}', account_id)
          .replace('{bot_id}', bot_id)
      : null;

  const { trigger, isMutating, data, error } = useSWRMutation(url, updateAgentBot);

  return {
    setPatchEditBot: (botId?: UpdateAgentBotArgsType['arg']) => trigger(botId || undefined),
    isLoading: isMutating,
    data,
    error,
  };
}
