export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // jamais stocker un mot de passe brut !
  role: "admin" | "client";
}
