import { NavigationBar } from "@/components/global/navigation/NavigationBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Provider } from "./components/global/provider/Web3Provider";

function App() {
  return (
    <Web3Provider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="min-h-screen">
          <NavigationBar />
        </div>
      </ThemeProvider>
    </Web3Provider>
  );
}

export default App;
