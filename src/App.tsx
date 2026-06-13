import { WorkspaceShell } from "./components/WorkspaceShell";
import "./styles/global.css";
import "./styles/workspace.css";

export function App() {
  return <WorkspaceShell activeStep="uploading" />;
}
