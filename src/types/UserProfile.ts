export type UserProfile = {
  email: string;
  keycloakId: string;
  name: {
    firstName: string;
    lastName: string;
  };
  roles: string[];
  userId: string;
};
