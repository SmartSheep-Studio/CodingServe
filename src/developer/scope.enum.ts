export default {
  scopes: [
    'all',
    'read:profile',
    'remove:developer',
    'write:developer',
    'read:developer',
  ],
  details: {
    all: 'Can read and write anythings with your account.',
    'read:profile': 'Can get your profile information.',

    'write:developer': 'Can create developer client.',
    'remove:developer': 'Can create developer client.',
    'read:developer': 'Can get your developer information.',
  },
};
