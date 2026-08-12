import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type UsuarioSessao } from "../lib/api";

interface AuthApi {user:UsuarioSessao|null;carregando:boolean;login:(login:string,senha:string)=>Promise<{ok:boolean;erro?:string}>;logout:()=>Promise<void>}
const AuthCtx=createContext<AuthApi|null>(null);

export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<UsuarioSessao|null>(null),[carregando,setCarregando]=useState(true);
  useEffect(()=>{authApi.me().then(setUser).catch(()=>setUser(null)).finally(()=>setCarregando(false))},[]);
  const api:AuthApi={user,carregando,login:async(login,senha)=>{try{setUser(await authApi.login(login,senha));return{ok:true}}catch(e){return{ok:false,erro:e instanceof Error?e.message:"Usuário ou senha inválidos."}}},logout:async()=>{try{await authApi.logout()}finally{setUser(null)}}};
  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>;
}
export function useAuth(){const ctx=useContext(AuthCtx);if(!ctx)throw new Error("useAuth precisa do AuthProvider");return ctx;}
