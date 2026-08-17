import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const ScrollToTop = ({ location, children }) => {
    const prevLocation = useRef(location);

    useEffect(() => {
        if (location !== prevLocation.current) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
        prevLocation.current = location;
    }, [location]);

    return children;
};

export default ScrollToTop;

ScrollToTop.propTypes = {
    location: PropTypes.object,
    children: PropTypes.any
};