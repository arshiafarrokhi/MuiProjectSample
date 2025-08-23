export interface WorkingHours {
  day_of_week: number;
  closed_all_day: boolean;
  open_hour: number | null;
  open_minutes: number | null;
  close_hour: number | null;
  close_minutes: number | null;
  open_all_day: boolean;
}

export interface PreChatField {
  name: string;
  type: any;
  label: string;
  enabled: boolean;
  required: boolean;
  field_type: string;
}

export interface PreChatFormOptions {
  pre_chat_fields: PreChatField[];
  pre_chat_message: string;
}

export interface inboxesType {
  id: number;
  avatar_url: string;
  channel_id: number;
  name: string;
  channel_type: string;
  greeting_enabled: boolean;
  greeting_message: string;
  working_hours_enabled: boolean;
  enable_email_collect: boolean;
  csat_survey_enabled: boolean;
  enable_auto_assignment: boolean;
  auto_assignment_config: any;
  out_of_office_message: string | null;
  working_hours: WorkingHours[];
  timezone: string;
  callback_webhook_url: string | null;
  allow_messages_after_resolved: boolean;
  lock_to_single_conversation: boolean;
  sender_name_type: string;
  business_name: string | null;
  widget_color: string;
  website_url: string;
  hmac_mandatory: boolean;
  welcome_title: string;
  welcome_tagline: string;
  web_widget_script: string;
  website_token: string;
  selected_feature_flags: any;
  reply_time: string;
  hmac_token: string;
  pre_chat_form_enabled: boolean;
  pre_chat_form_options: PreChatFormOptions;
  continuity_via_email: boolean;
  messaging_service_sid: string | null;
  phone_number: string | null;
  provider: string | null;
}

export interface AgentsType {
  access_token: {
    created_at: string;
    id: number;
    owner_id: number;
    owner_type: string;
    token: string;
    updated_at: string;
    account_id: number;
  };
  bot_config: Record<string, unknown>;
  bot_type: string;
  description: string;
  id: number;
  name: string;
  outgoing_url: string;
}
