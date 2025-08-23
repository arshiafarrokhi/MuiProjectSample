import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (
  args: string | [string, AxiosRequestConfig],
  p0?: { method: string; data: { bot_id: string } }
) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/users/profile/',
    signIn: '/users/login/',
    signUp: '/auth/sign-up/',
  },
  users: {
    get: '/Users/GetUsers?Pagination.PageIndex=1&ActiveUsers=true',
    // getAgents: 'accounts/{account_id}/agent_bots/',
    // setAgents: 'accounts/{account_id}/inboxes/{inbox_id}/set_agent_bot',
    // getDefaultAgents: 'accounts/{account_id}/inboxes/{inbox_id}/agent_bot',
  },
  // bots: {
  //   getBots: '/accounts/{account_id}/agent_bots/',
  //   getCreateBots: '/accounts/{account_id}/agent_bots/',
  //   deleteBot: '/accounts/{account_id}/agent_bots/{bot_id}/',
  //   defaultEditBot: 'accounts/{account_id}/agent_bots/{bot_id}/',
  //   patchDefaultEditBot: 'accounts/{account_id}/agent_bots/{bot_id}/',
  // },
  // knowledgeBases: {
  //   dataSource: {
  //     getDS: '/accounts/{account_id}/knowledge_bases/{knowledge_base_id}/data_sources',
  //     deleteDS: '/accounts/{account_id}/knowledge_bases/{knowledge_base_id}/data_sources/{data_source_id}',
  //     CreateDSFile: '/accounts/{account_id}/knowledge_bases/{knowledge_base_id}/data_sources/upload_file',
  //     CreateDSText: '/accounts/{account_id}/knowledge_bases/{knowledge_base_id}/data_sources',
  //   },
  //   getKnowledgeBases: '/accounts/{account_id}/knowledge_bases/',
  //   deleteKnowledgeBases: '/accounts/{account_id}/knowledge_bases/{knowledge_base_id}',
  //   getCreateKnowledgeBases: '/accounts/{account_id}/knowledge_bases/',
  //   defaultEditKnowledgeBases: '/accounts/{account_id}/knowledge_bases/{knowledge_base_id}',
  //   patchDefaultEditKnowledgeBases: 'accounts/{account_id}/knowledge_bases/{knowledge_base_id}',
  // },
  // llm: '/choices/llms',
  // ChunkMethods: '/choices/chunk_methods',
};
