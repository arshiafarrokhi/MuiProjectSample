export interface BotsType {
  id: number;
  name: string;
  description: string;
  llm_model: string;
}

export interface BotsDetailType {
  account_id: number;
  answer_token: string;
  chatwoot_access_token: string;
  created_at: string;
  description: string;
  id: number;
  knowledge_bases: {
    id: number;
    name: string;
  };
  llm_model: string;
  modified_at: string;
  name: string;
  system_prompt: string;
  temperature: number;
  user_prompt: string;
}

export interface LLMModelType {
  name: string;
  value: string;
}

export interface UpdateAgentBotArgsType {
  arg: {
    name?: string;
    description?: string;
    temperature?: number;
    llm_model?: string;
    system_prompt?: string;
    user_prompt?: string;
  };
}
export interface AddAgentBotArgsType {
  arg: {
    name?: string;
    description?: string;
  };
}
