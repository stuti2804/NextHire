export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: {
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    jobAlerts: boolean;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}
