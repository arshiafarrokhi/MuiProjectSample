// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: {
        root: `${ROOTS.AUTH}/jwt/sign-up`,
        otp: `${ROOTS.AUTH}/jwt/sign-up/otp`,
      },
      forgetPassword: `${ROOTS.AUTH}/jwt/forget-password`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: `${ROOTS.DASHBOARD}/users`,
    users: `${ROOTS.DASHBOARD}/users`,
    // AgentBots: `${ROOTS.DASHBOARD}/agentBots`,
    // agentBots: {
    //   root: `${ROOTS.DASHBOARD}/agentBots`,
    //   new: `${ROOTS.DASHBOARD}/agentBots/new`,
    //   edit: (botId: number, botName: string) =>
    //     `${ROOTS.DASHBOARD}/agentBots/${botId}/${botName}/edit`,
    // },
    // KnowledgeBases: {
    //   root: `${ROOTS.DASHBOARD}/knowledgeBases`,
    //   new: `${ROOTS.DASHBOARD}/knowledgeBases/new`,
    //   edit: (knowledgeBasesId: number, knowledgeBasesName: string) =>
    //     `${ROOTS.DASHBOARD}/knowledgeBases/${knowledgeBasesId}/${knowledgeBasesName}/edit`,
    // },
  },
};
