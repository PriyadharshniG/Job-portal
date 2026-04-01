
import {
    AdminLinks,
    UserLinks,
    RecruiterLinks,
} from "../../utils/DashboardNavLinkData";
import { NavLink } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

const DashboardNavLinks = ({ collapsed = false }) => {
    const { user } = useUserContext();

    const renderLinks = (links) =>
        links?.map((link) => {
            const { text, path, icon } = link;
            if (path === "admin" && user?.role !== "admin") return null;
            return (
                <NavLink
                    to={path}
                    key={text}
                    className="nav-link"
                    end
                    data-tooltip={collapsed ? text : undefined}
                >
                    <span className="icon">{icon}</span>
                    <span className="link-text">{text}</span>
                </NavLink>
            );
        });

    const links =
        user?.role === "admin"
            ? AdminLinks
            : user?.role === "recruiter"
            ? RecruiterLinks
            : UserLinks;

    return <div className="nav-links">{renderLinks(links)}</div>;
};

export default DashboardNavLinks;
