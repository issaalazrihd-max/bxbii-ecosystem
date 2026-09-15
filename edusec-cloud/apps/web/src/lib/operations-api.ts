const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function token() {
  const refreshToken = typeof window !== "undefined" ? sessionStorage.getItem("bxbii.refreshToken") : null;
  if (!refreshToken) throw new Error("Session expired");
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({refreshToken}) });
  if (!res.ok) throw new Error("Session expired");
  const data = await res.json();
  sessionStorage.setItem("bxbii.refreshToken", data.refreshToken);
  return data.accessToken as string;
}

async function request<T>(path:string, options:RequestInit={}) {
  const accessToken = await token();
  const res = await fetch(`${API_URL}/api/v1/academic-operations${path}`, { ...options, headers:{"Content-Type":"application/json",Authorization:`Bearer ${accessToken}`,...options.headers} });
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).message ?? "Request failed");
  return res.json() as Promise<T>;
}

export type OperationsData = { rooms:any[]; sessions:any[]; attendance:any[]; assessments:any[]; certificates:any[]; crm:any[] };
export const operationsApi = {
  overview:()=>request<OperationsData>("/overview"),
  createRoom:(dto:any)=>request<any[]>("/rooms",{method:"POST",body:JSON.stringify(dto)}),
  createSession:(dto:any)=>request<any[]>("/sessions",{method:"POST",body:JSON.stringify(dto)}),
  markAttendance:(dto:any)=>request<any[]>("/attendance",{method:"POST",body:JSON.stringify(dto)}),
  createAssessment:(dto:any)=>request<any[]>("/assessments",{method:"POST",body:JSON.stringify(dto)}),
  issueCertificate:(dto:any)=>request<any[]>("/certificates",{method:"POST",body:JSON.stringify(dto)}),
  createCrm:(dto:any)=>request<any[]>("/crm",{method:"POST",body:JSON.stringify(dto)}),
};
