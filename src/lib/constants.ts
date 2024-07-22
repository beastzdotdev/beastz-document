export const constants = {
  externalLinks: {
    beastzVault: 'https://vault.beastz.dev',

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
};
