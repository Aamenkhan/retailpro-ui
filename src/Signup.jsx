import { Navigate, useSearchParams } from "react-router-dom";

/** Legacy /signup URLs → real app register (faster conversion). */
export default function Signup() {
  const [params] = useSearchParams();
  const q = params.toString();
  return <Navigate to={q ? `/app?register=1&${q}` : "/app?register=1"} replace />;
}
