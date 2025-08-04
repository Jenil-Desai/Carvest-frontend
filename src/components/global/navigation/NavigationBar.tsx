import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectKitButton } from "connectkit";
import { Moon, Sun } from "lucide-react";

export function NavigationBar() {
  const { setTheme, theme } = useTheme();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center justify-between p-4 rounded-full shadow-lg z-50 w-[90vw] max-w-4xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
      <span className="text-lg font-bold">Carvest</span>
      <div className="flex items-center gap-4">
        <ConnectKitButton
          showAvatar={true}
          showBalance={true}
          mode={
            theme === "dark" ? "dark" : theme === "light" ? "light" : "auto"
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="rounded-full">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
