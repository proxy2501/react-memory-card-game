// !! DEPRECIATED !!
// As the API that provided the online theme is no longer accessible, this file remains as an artifact. It is no longer used in the application.

import { useEffect, useState } from "react";

function useOnlineTheme() {
    const [accessToken, setAccessToken] = useState(null);
    const [colorCodes, setColorCodes] = useState(null);
    const [imageLocations, setImageLocations] = useState(null);
    const [theme, setTheme] = useState(null);

    // Fetches the bearer token for API access.
    useEffect(() => {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        let urlencoded = new URLSearchParams();
        urlencoded.append("Client_Id", "c763b298-475d-434e-b6d9-b6c2b91dd71a");
        urlencoded.append("Client_Secret", "bda67075-bf22-4377-8e25-6304ff0136d0");
        urlencoded.append("grant_type", "client_credentials");

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded
        };

        fetch("https://identity.complianty.com/connect/token", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw Error("failed to receive ok when fetching access token");
                }
                return response.json();
            })
            .then(json => setAccessToken(json.access_token))
            .catch(error => console.warn(error.message));
    }, []);

    // Upon access token received, fetches color codes.
    useEffect(() => {
        if (!accessToken) return;

        let myHeaders = new Headers();
        myHeaders.append("Authorization", ("Bearer " + accessToken));

        let requestOptions = {
            method: 'GET',
            headers: myHeaders
        };

        fetch("http://api.gateway.admin.complianty.com/Tenants/v1/112/Tenants/112", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw Error("failed to receive ok when fetching color codes");
                }
                return response.json();
            })
            .then(json => setColorCodes(json.theming))
            .catch(error => console.warn(error.message));

    }, [accessToken]);

    // Upon access token received, fetches image locations.
    useEffect(() => {
        if (!accessToken) return;

        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + accessToken);

        let requestOptions = {
            method: 'GET',
            headers: myHeaders
        };

        fetch("http://api.gateway.admin.complianty.com/ImageGalleries/v1/112/ImageGalleries/9/lazyload", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw Error("failed to receive ok when fetching image locations");
                }
                return response.json();
            })
            .then(json => {
                let imageObjects = json.imageGalleryImages;
                let locationsArray = [];
                imageObjects.forEach(element => {
                    locationsArray.push(element.imageLocation);
                });
                setImageLocations(locationsArray);
            })
            .catch(error => console.warn(error.message));

    }, [accessToken]);

    // Upon all fetch requests successful, produces the theme object.
    useEffect(() => {
        if (!colorCodes || !imageLocations) return;

        setTheme({
            name: "online",
            textColor: colorCodes.cssTextColor,
            buttonColor: colorCodes.cssActionColor,
            backgroundColor: colorCodes.cssFooterBackgroundColor,
            menuColor: colorCodes.cssMenuColor,
            backgroundBoxColor: colorCodes.cssBackgroundBoxColor,
            buttonTextColor: colorCodes.cssFooterTextColor,
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
            cardSource: imageLocations
        });

    }, [colorCodes, imageLocations]);

    return theme;
}

export default useOnlineTheme;