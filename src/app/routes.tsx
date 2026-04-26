import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Requests";
import Schedule from "./pages/RoutePage";
import Track from "./pages/JobDetail";
import Impact from "./pages/Earnings";
import HistoryPage from "./pages/History";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "schedule", Component: Schedule },
      { path: "track", Component: Track },
      { path: "impact", Component: Impact },
      { path: "history", Component: HistoryPage },
      { path: "profile", Component: Profile },
    ],
  },
]);
