export const constants = {
  path: {
    backend: {
      baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL as string,
    },

    home: '/home',
    oops: '/404',
  },

  externalLinks: {
    beastzVault: process.env.NEXT_PUBLIC_VAULT_URL!,

    get signIn() {
      return `${this.beastzVault}/auth/sign-in`;
    },
    get authVerify() {
      return `${this.beastzVault}/auth/verify`;
    },

    get profileEdit() {
      return `${this.beastzVault}/profile`;
    },
  },

  headers: {
    pathname: 'x-next-pathname',
  },

  ui: {
    themes: <Record<string, string>>{
      System: 'system',
      Light: 'light',
      Dark: 'dark',
      Orange: 'orange',
      Green: 'green',
      'Green Slate': 'green-slate',
      Yellow: 'yellow',
      Tulip: 'tulip',
      Cactus: 'cactus',
      Vulcano: 'vulcano',
    },
  },

  general: {
    tabEditModePrefix: '● ',
    localStorageViewTypeKey: 'default_items_view',
    queryTitleForDocument: 'title',
    querySharedUniqueHash: 'sharedUniqueHash',
  },

  socket: {
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL as string,

    get documentSocketUrl() {
      return `${this.socketUrl}/document`;
    },

    events: {
      PushDoc: 'push_doc',
      PullDoc: 'pull_doc',
      PullDocFull: 'pull_doc_full',
      UserLeft: 'user_left',
      UserJoined: 'user_joined',
      RetryConnection: 'retry_connection',
      DocumentShareDisabled: 'document_share_disabled',
    },
  },
};
