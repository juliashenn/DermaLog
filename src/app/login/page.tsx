import { redirectIfAuth } from "@/lib/auth";
import LoginForm from "./loginForm";

export default async function LoginPage() {
  await redirectIfAuth(); 
  return <LoginForm />;   
}
