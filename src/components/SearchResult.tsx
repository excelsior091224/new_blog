import { BrowserRouter as Router,useLocation } from "react-router-dom";

export default function ReactComponent() {
    const query = new URLSearchParams(window.location.search);
    // const search = useLocation().search;
    // const query = new URLSearchParams(search);
    return (
        <Router>
        <h1>Hello from React Component</h1>
        <h3>{query.get("q")}</h3>
        </Router>
    );
}