import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from '../pages/Home/Home';
import PlanPage from "../pages/Plan";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/plan" element={<PlanPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;