import React from "react";
import { useDashboardContext } from "../Pages/DashboardLayout";
import { NavLink } from "react-router-dom";
import links from "../utils/links";

const NavLinks = (props) => {
  const { toggleSidebar, user, showSidebar } = useDashboardContext();

  return (
    <div className="nav-links">
      {links.map((link) => {
        const { text, path, icon } = link;
        const { role } = user;
        if (path === "admin" && role != "admin") return;
        return (
          <NavLink
            to={path}
            key={text}
            className="nav-link"
            onClick={props.isBigSidebar ? "" : toggleSidebar}
            end
          >
            <span className="icon">{icon}</span>
            {text}
          </NavLink>
        );
      })}
    </div>
  );
};

export default NavLinks;
