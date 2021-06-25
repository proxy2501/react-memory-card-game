import React, { useContext } from 'react';
import './stylesheets/popup.css'
import { ThemeContext } from './ThemeContext';

function Popup(props) {
    const { trigger } = props;
    const theme = useContext(ThemeContext);

    return (
        <div className={"popup" + (trigger ? "" : " hide")}>
            <div className="children" style={{ backgroundColor: theme.menuColor }}>
                {props.children}
            </div>
        </div>
    );
}

export default Popup;