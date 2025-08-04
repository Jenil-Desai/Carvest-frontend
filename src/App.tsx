import { NavigationBar } from "@/components/global/navigation/NavigationBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Provider } from "./components/global/provider/Web3Provider";
import { Route, Switch } from "wouter";
import { HomePage } from "./containers/home/Page";
import { NotFoundPage } from "./containers/404/Page";
import { CampaignPage } from "./containers/campaigns/Page";

function App() {
  return (
    <Web3Provider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="min-h-screen">
          <NavigationBar />
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/campaigns" component={CampaignPage} />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </div>
      </ThemeProvider>
    </Web3Provider>
  );
}

export default App;
